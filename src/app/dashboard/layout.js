import styles from './dashboard.module.css';
export default function DashboardShell({ children }) {
  return <div className={styles.shell}>{children}<footer className={styles.footer}>Hecho para celebrar lo que importa. <span>Invito ✳</span></footer></div>;
}
