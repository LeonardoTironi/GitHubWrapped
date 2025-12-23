import { Octokit } from "@octokit/core";
import { Session } from "next-auth";
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
export async function fetchGitHubStats(session: Session) {
  if (!session?.accessToken) {
    throw new Error("Não autenticado");
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  // 1. Busca dados do GitHub via GraphQL
  const currentYear = new Date().getFullYear();
  const data = await octokit.graphql(GITHUB_WRAPPED_QUERY, {
    login: session.user?.login || "",
    from: `${currentYear}-01-01T00:00:00Z`,
    to: `${currentYear}-12-31T23:59:59Z`,
  }) as RawGraphQLData;

  // 2. Busca amostra de commits para auditoria (últimos 100)
  const commitMessages: string[] = [];
  try {
    const repos = data.user.repositories.nodes.slice(0, 5); // Pega os 5 primeiros repos
    for (const repo of repos) {
      if (commitMessages.length >= 100) break;
      
      try {
        const { data: commits } = await octokit.request(
          "GET /repos/{owner}/{repo}/commits",
          {
            owner: session.user?.login || "",
            repo: repo.name,
            per_page: 20,
          }
        );
        commitMessages.push(...commits.map((c) => c.commit.message));
      } catch (repoError: unknown) {
        // Ignora erros de repos vazios ou privados
        const error = repoError as { status?: number; message?: string };
        if (error.status !== 409 && error.status !== 404) {
          console.error(`Erro ao buscar commits do repo ${repo.name}:`, error.message);
        }
        continue;
      }
    }
  } catch (err) {
    console.error("Erro ao buscar commits:", err);
  }

  return { data, commitMessages };
}