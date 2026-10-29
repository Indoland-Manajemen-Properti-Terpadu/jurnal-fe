import classes from '../pages/LandingPage.module.css';

interface SectionHeadProps {
  kicker: string;
  title: string;
  subtitle: string;
}

export function SectionHead({ kicker, title, subtitle }: SectionHeadProps) {
  return (
    <div className={classes.sectionHead}>
      <span className={classes.kicker}>{kicker}</span>
      <h2 className={classes.sectionTitle}>{title}</h2>
      <p className={classes.sectionSubtitle}>{subtitle}</p>
    </div>
  );
}
