import { Octokit } from "@octokit/core";
import { RawGraphQLData } from "./stats-processor";

/**
 * Query GraphQL para coletar métricas do GitHub
 * Retorna contribuições, linguagens, repositórios e seguidores
 */

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

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  const currentYear = new Date().getFullYear();
  const fromDate = `${currentYear}-01-01T00:00:00Z`;
  const toDate = `${currentYear}-12-31T23:59:59Z`;
  const userLogin = session.login || session.user?.login || "";

  // 1. Busca dados do GraphQL (Contagens precisas)
  const data = await octokit.graphql(GITHUB_WRAPPED_QUERY, {
    login: userLogin,
    from: fromDate,
    to: toDate,
  }) as RawGraphQLData;

  // 2. Busca mensagens de commits
  // Correção: Usamos os repositórios onde HOUVE contribuição, não apenas os que você é dono
  const contributedRepos = data.user.contributionsCollection.commitContributionsByRepository;
  
  const commitMessages: string[] = [];
  
  // Define um limite de segurança para não estourar o Rate Limit da API do GitHub
  // 50 repositórios x 30 commits = 1500 requisições potenciais (cuidado com o limite de 5000/hora)
  const MAX_REPOS_TO_SCAN = 50; 
  const COMMITS_PER_REPO = 30; 

  // Ordena por quantidade de contribuições para priorizar os repositórios mais ativos
  const topRepos = contributedRepos
    .sort((a, b) => b.contributions.totalCount - a.contributions.totalCount)
    .slice(0, MAX_REPOS_TO_SCAN);

  // Usamos Promise.all para paralelizar (com cuidado), ou loop for...of para sequencial
  for (const contribution of topRepos) {
    // Extrai dono e nome (nameWithOwner vem como "facebook/react")
    const [owner, repo] = contribution.repository.nameWithOwner.split("/");

    try {
      const { data: commits } = await octokit.request("GET /repos/{owner}/{repo}/commits", {
        owner: owner,
        repo: repo,
        author: userLogin, // IMPORTANTE: Filtra apenas commits SEUS
        since: fromDate,   // IMPORTANTE: Dentro do intervalo de tempo
        until: toDate,
        per_page: COMMITS_PER_REPO,
      });

      if (commits.length > 0) {
        commitMessages.push(...commits.map((c) => c.commit.message));
      }
    } catch (repoError: unknown) {
      // Tratamento de erro silencioso para repositórios que podem ter deixado de existir ou acesso negado
      const error = repoError as { status?: number };
      if (error.status !== 404 && error.status !== 403) {
        console.warn(`Falha ao ler commits de ${owner}/${repo}`);
      }
    }
  }

  return { data, commitMessages };
}