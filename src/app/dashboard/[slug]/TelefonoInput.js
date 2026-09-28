"use client";
import { callingCodes, splitPhone } from "@/lib/phone-country";

export default function TelefonoInput({ value, onChange, disabled = false }) {
  return <div className="grid gap-3 sm:grid-cols-2">
    <label>País / código
      <select value={value.codigo} disabled={disabled} onChange={event=>onChange({...value,codigo:event.target.value})}>
        {callingCodes.map(([codigo,pais])=><option key={codigo} value={codigo}>{pais} (+{codigo})</option>)}
        <option value="">Otro país (número internacional)</option>
      </select>
    </label>
    <label>{value.codigo ? 'Número de teléfono' : 'Número completo con código de país'}
      <input type="tel" inputMode="tel" autoComplete="off" disabled={disabled} value={value.numero}
        placeholder={value.codigo==='52'?'55 1234 5678':'Número de teléfono'}
        onChange={event=>{
          const numero=event.target.value;
          if (/^\s*(\+|00)/.test(numero)) onChange(splitPhone(numero,value.codigo));
          else onChange({...value,numero});
        }} />
    </label>
  </div>;
}
