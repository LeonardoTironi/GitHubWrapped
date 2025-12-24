import { Octokit } from "@octokit/core";
import { RawGraphQLData } from "./stats-processor";
import { paginateRest } from "@octokit/plugin-paginate-rest"; // Você pode precisar adicionar esse plugin se usar o core puro, ou usar 'octokit' package padrão
/**
 * Query GraphQL para coletar métricas do GitHub
 * Retorna contribuições, linguagens, repositórios e seguidores
 */
const MyOctokit = Octokit.plugin(paginateRest);
export const GITHUB_WRAPPED_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      name
      followers {
        totalCount
      }
      following {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
        
        commitContributionsByRepository {
          repository {
            name
            nameWithOwner
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
          contributions {
            totalCount
          }
        }
      }
      
      repositories(
        first: 100
        orderBy: {field: CREATED_AT, direction: DESC}
        ownerAffiliations: OWNER
      ) {
        totalCount
        nodes {
          name
          createdAt
          primaryLanguage {
            name
            color
          }
          isPrivate
        }
      }
    }
  }
`;

/**
 * Busca os dados brutos e mensagens de commit do GitHub
 */
export async function fetchGitHubStats(session: { 
  accessToken?: string; 
  login?: string;
  user?: { login?: string };
}) {
  if (!session?.accessToken) {
    throw new Error("Não autenticado");
  }

  // Instancia com suporte a paginação
  const octokit = new MyOctokit({
    auth: session.accessToken,
  });

  const currentYear = new Date().getFullYear();
  const fromDate = `${currentYear}-01-01T00:00:00Z`;
  const toDate = `${currentYear}-12-31T23:59:59Z`;
  const userLogin = session.login || session.user?.login || "";

  // 1. GraphQL para estatísticas macro (Rápido e preciso para contagens)
  const data = await octokit.graphql(GITHUB_WRAPPED_QUERY, {
    login: userLogin,
    from: fromDate,
    to: toDate,
  }) as RawGraphQLData;

  // 2. Busca mensagens de commits com paginação total
  const contributedRepos = data.user.contributionsCollection.commitContributionsByRepository;
  const commitMessages: string[] = [];

  // Ordena para garantir que pegamos os repositórios mais importantes primeiro caso dê erro
  const allRepos = contributedRepos.sort((a, b) => b.contributions.totalCount - a.contributions.totalCount);

  console.log(`Iniciando busca detalhada em ${allRepos.length} repositórios...`);

  for (const contribution of allRepos) {
    const [owner, repo] = contribution.repository.nameWithOwner.split("/");
    
    // Pula repositórios deletados ou sem nome
    if (!owner || !repo) continue;

    try {
      // O método paginate itera automaticamente todas as páginas
      const commits = await octokit.paginate("GET /repos/{owner}/{repo}/commits", {
        owner: owner,
        repo: repo,
        author: userLogin, // Filtra apenas SEUS commits
        since: fromDate,
        until: toDate,
        per_page: 100, // Máximo permitido por página para reduzir requisições
      });

      // Mapeia apenas as mensagens
      const messages = commits.map((c: any) => c.commit.message);
      commitMessages.push(...messages);
      
      console.log(`[${owner}/${repo}] ${messages.length} commits encontrados.`);

    } catch (repoError: unknown) {
      const error = repoError as { status?: number; message?: string };
      
      // 409 = Repositório vazio
      // 404 = Não encontrado (talvez você tenha perdido acesso)
      // 403 = Forbidden (pode ser restrição de organização ou rate limit)
      if (error.status === 403) {
        console.warn(`Acesso negado ou limite atingido em ${owner}/${repo}.`);
      } else if (error.status !== 409 && error.status !== 404) {
        console.error(`Erro em ${owner}/${repo}:`, error.message);
      }
    }
  }

  return { data, commitMessages };
}