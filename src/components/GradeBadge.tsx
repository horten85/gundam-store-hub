interface GradeBadgeProps {
  grade: string;
}

export const GradeBadge = ({ grade }: GradeBadgeProps) => {
  const gradeUpper = grade.toUpperCase();
  const gradeClass = `grade-${grade.toLowerCase()}`;
  
  const gradeNames: Record<string, string> = {
    HG: "High Grade",
    MG: "Master Grade",
    SD: "Super Deformed",
    PG: "Perfect Grade",
    RG: "Real Grade",
  };

  return (
    <span className={`grade-badge ${gradeClass}`}>
      {gradeUpper} - {gradeNames[gradeUpper] || gradeUpper}
    </span>
  );
};