/**
 * Statistics Processing Logic - GitHub Wrapped 2025
 */

export interface RawGraphQLData {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: Array<{
          contributionDays: Array<{
            contributionCount: number;
            date: string;
          }>;
        }>;
      };
      totalCommitContributions: number;
      commitContributionsByRepository: Array<{
        repository: {
          name: string;
          languages: {
            edges: Array<{ size: number; node: { name: string; color: string } }>;
          };
        };
        contributions: { totalCount: number };
      }>;
    };
    repositories: {
      nodes: Array<{ name: string; createdAt: string }>;
    };
    followers: {
      totalCount: number;
    };
  };
}

export const processGitHubStats = (data: RawGraphQLData, commitMessages: string[] = []) => {
  const { user } = data;
  const contributions = user.contributionsCollection;

  // 1. Streak Calculation (Sequence of Days)
  let maxStreak = 0;
  let currentStreak = 0;
  
  const allDays = contributions.contributionCalendar.weeks
    .flatMap(week => week.contributionDays)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  allDays.forEach(day => {
    if (day.contributionCount > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });

  // 2. Style Audit (Architect vs. Poet)
  // Conventional Commits pattern: type(scope): description
  const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+/i;
  
  const standardizedCount = commitMessages.filter(msg => conventionalRegex.test(msg)).length;
  const auditRatio = commitMessages.length > 0 ? standardizedCount / commitMessages.length : 0;
  
  const category = auditRatio >= 0.5 ? "Commit Architect" : "Software Poet";

  // 3. Language Processing (Aggregated by bytes)
  const langMap: Record<string, { size: number; color: string }> = {};
  
  contributions.commitContributionsByRepository.forEach(repo => {
    repo.repository.languages.edges.forEach(edge => {
      const { name, color } = edge.node;
      if (!langMap[name]) {
        langMap[name] = { size: 0, color };
      }
      langMap[name].size += edge.size;
    });
  });

  const totalBytes = Object.values(langMap).reduce((acc, curr) => acc + curr.size, 0);
  const topLanguages = Object.entries(langMap)
    .map(([name, info]) => ({
      name,
      color: info.color,
      percentage: totalBytes > 0 ? (info.size / totalBytes) * 100 : 0
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  // 4. Repositories Created This Year
  const currentYear = new Date().getFullYear();
  const createdThisYear = user.repositories.nodes.filter(repo => {
    return new Date(repo.createdAt).getFullYear() === currentYear;
  }).length;

  return {
    maxStreak,
    category,
    auditRatio: (auditRatio * 100).toFixed(1),
    topLanguages,
    createdThisYear,
    totalCommits: contributions.totalCommitContributions,
    // Note: Peak Hour requires sampling commit timestamps (REST or detailed Nodes)
  };
};