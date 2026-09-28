import { getPanelSession } from '@/lib/panel-server';
import CrearEvento from './CrearEvento';
export default async function NuevoEventoPage(){await getPanelSession(true);return <main className="mx-auto p-4 sm:p-8"><p className="dash-eyebrow">UNA CELEBRACIÓN POR PREPARAR</p><h1>Nuevo evento</h1><CrearEvento/></main>;}
