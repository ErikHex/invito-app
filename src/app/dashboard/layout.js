import styles from './dashboard.module.css';
import CerrarSesion from '@/components/CerrarSesion';
export default function DashboardShell({ children }) {
  return <div className={styles.shell}><div className={`${styles.accountBar} dashboard-account-bar`}><CerrarSesion /></div>{children}<footer className={styles.footer}>Hecho para celebrar lo que importa. <span>Invito ✳</span></footer></div>;
}
