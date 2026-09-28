"use client";
import { useState } from "react";
import TelefonoInput from "./TelefonoInput";
import { splitPhone, joinPhone } from "@/lib/phone-country";
import SeleccionarContacto from "./SeleccionarContacto";
import { createClient } from "@/lib/supabase/client";
import { generarToken } from "@/lib/generarToken";
import { normalizePhone, validPhone } from "@/lib/invitation-utils";
export default function AgregarInvitado({eventoId,onAgregado}) {
  const [nombre,setNombre]=useState('');
  const [telefonoDatos,setTelefonoDatos]=useState({codigo:'52',numero:''});
  const telefono=joinPhone(telefonoDatos);
  const [acompanantes,setAcompanantes]=useState(0);
  const [guardando,setGuardando]=useState(false);
  const [error,setError]=useState('');
  async function guardar(event) {
    event.preventDefault();setError('');
    if(!nombre.trim()) {setError('Escribe un nombre o familia.');return;}
    if(telefono && !validPhone(telefono)) {setError('Escribe el teléfono completo con código de país.');return;}
    setGuardando(true);
    try {
      const {data,error}=await createClient().from('invitados').insert({evento_id:eventoId,nombre:nombre.trim(),telefono:normalizePhone(telefono)||null,acompanantes:Number(acompanantes),token:generarToken(),estado:'pendiente'}).select().single();
      if(error)throw error;
      onAgregado(data);setNombre('');setTelefonoDatos({codigo:'52',numero:''});setAcompanantes(0);
    } catch {setError('No pudimos agregar la invitación. Revisa tu conexión e intenta de nuevo.');}
    finally {setGuardando(false);}
  }
  return <form onSubmit={guardar} className="rounded-xl bg-white p-5 shadow-sm mb-6">
    <h2>Una invitación más, alguien especial.</h2><p className="helper">Registra una persona o familia. El teléfono es opcional; inclúyelo para abrir su chat de WhatsApp.</p>
    <fieldset disabled={guardando} className="grid gap-4 md:grid-cols-3">
      <label>Nombre o familia<input required maxLength={160} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Familia Pérez" /></label>
      <div><TelefonoInput value={telefonoDatos} onChange={setTelefonoDatos} disabled={guardando} />
      <SeleccionarContacto disabled={guardando} onSelect={contacto=>{setTelefonoDatos(splitPhone(contacto.telefono,telefonoDatos.codigo));setNombre(actual=>actual.trim()?actual:contacto.nombre);}} /></div>
      <label>Acompañantes<input type="number" required min="0" max="100" value={acompanantes} onChange={e=>setAcompanantes(e.target.value)} /></label>
      <button className="dash-primary" type="submit">{guardando?'Agregando…':'Agregar invitación'}</button>
    </fieldset>
    {error && <p role="alert" className="text-red-700 mt-3">{error}</p>}
  </form>;
}
