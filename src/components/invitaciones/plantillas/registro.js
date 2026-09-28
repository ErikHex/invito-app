import Editorial from "./editorial/Editorial";
import dynamic from "next/dynamic";

const AuraXV = dynamic(() => import("./aura-xv/AuraXV"));

export const plantillas = Object.freeze({ editorial: Editorial, aura_xv: AuraXV });
