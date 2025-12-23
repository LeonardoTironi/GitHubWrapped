import React from "react";

interface Language {
  name: string;
  color: string;
  percentage: number;
}

interface WrappedData {
  username: string;
  year: number;
  category: string;
  auditRatio: string;
  max_streak: number;
  totalCommits: number;
  createdThisYear: number;
  followers: number;
  topLanguages: Language[];
}

export const WrappedCard = ({ data }: { data: WrappedData }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "900px",
        height: "1300px",
        backgroundColor: "#161b22",
        padding: "60px",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "50px",
        }}
      >
        <span style={{ fontSize: "54px", fontWeight: 700, color: "#c9d1d9" }}>
          Dev Wrapped {data.year}
        </span>
        <span style={{ fontSize: "32px", color: "#8b949e", marginTop: "8px" }}>
          @{data.username}
        </span>
      </div>

      {/* TOTAL COMMITS - DESTAQUE */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "50px",
        }}
      >
        <span
          style={{
            fontSize: "140px",
            fontWeight: 700,
            color: "#58a6ff",
            lineHeight: "1",
            letterSpacing: "-2px",
          }}
        >
          {data.totalCommits}
        </span>
        <span style={{ fontSize: "24px", color: "#8b949e", marginTop: "12px" }}>
          Total Commits in the Year
        </span>
      </div>

      {/* CATEGORIA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "50px",
        }}
      >
        <span
          style={{
            fontSize: "30px",
            fontWeight: 600,
            color: "#c9d1d9",
          }}
        >
          {data.category}
        </span>
        <span style={{ fontSize: "18px", color: "#8b949e", marginTop: "8px" }}>
          {data.auditRatio}% follow best practices (Conventional Commits)
        </span>
      </div>

      {/* MAX STREAK */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "50px",
        }}
      >
        <span
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#58a6ff",
            marginBottom: "12px",
          }}
        >
          Max Streak
        </span>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontSize: "76px",
              fontWeight: 700,
              color: "#58a6ff",
              lineHeight: "1",
            }}
          >
            {data.max_streak}
          </span>
        </div>
      </div>

      {/* LINGUAGENS PREDOMINANTES */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "30px",
        }}
      >
        <span
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#58a6ff",
            marginBottom: "10px",
          }}
        >
          Top Languages
        </span>
        {data.topLanguages.slice(0, 5).map((lang, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                fontSize: "20px",
                color: "#c9d1d9",
              }}
            >
              <span style={{ minWidth: "200px" }}>{lang.name}</span>
              <span style={{ color: "#8b949e", marginLeft: "auto" }}>
                {lang.percentage.toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "8px",
                backgroundColor: "#30363d",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${lang.percentage}%`,
                  height: "100%",
                  backgroundColor: lang.color || "#3fb950",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div
        style={{ display: "flex", marginTop: "auto", justifyContent: "center" }}
      >
        <span style={{ fontSize: "16px", color: "#484f58" }}>
          Generated at dev-wrapped-2025.vercel.app
        </span>
      </div>
    </div>
  );
};
