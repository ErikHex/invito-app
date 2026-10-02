import Editorial from "./editorial/Editorial";
import dynamic from "next/dynamic";

const AuraXV = dynamic(() => import("./aura-xv/AuraXV"));
const Nocturno = dynamic(() => import("./nocturno/Nocturno"));
const JardinRomantico = dynamic(() => import("./jardin-romantico/JardinRomantico"));

export const plantillas = Object.freeze({
  editorial: Editorial,
  aura_xv: AuraXV,
  nocturno: Nocturno,
  jardin_romantico: JardinRomantico,
});
