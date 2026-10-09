import test from "node:test";
import assert from "node:assert/strict";
import {
  pinterestUrl,
  validClabe,
  normalizePhone,
  validPhone,
  guestMatches,
  invitationField,
} from "../src/lib/invitation-utils.js";
import { temaInvitacion } from "../src/lib/invitation-theme.js";

test("palette resolves readable section text for dark backgrounds", () => {
  const tema = temaInvitacion(
    { tema: { paleta: "neutros:noche" } },
    "editorial",
  );
  assert.equal(tema.fondo, "#171719");
  assert.equal(tema.textoPrincipal, "#F8F1E7");
});

test("saved invitation fields override legacy content, including cleared text and photos", () => {
  const editorial = { mensajeBase: "Anterior", fotoMensaje: "old.jpg" };
  assert.equal(
    invitationField({ editorial, mensajeBase: "Nuevo" }, "mensajeBase"),
    "Nuevo",
  );
  assert.equal(
    invitationField({ editorial, mensajeBase: "" }, "mensajeBase"),
    "",
  );
  assert.equal(
    invitationField({ editorial, fotoMensaje: null }, "fotoMensaje"),
    null,
  );
  assert.equal(invitationField({ editorial }, "fotoMensaje"), "old.jpg");
});
test("Pinterest accepts HTTPS boards and rejects deceptive domains or scripts", () => {
  assert.equal(
    pinterestUrl("https://www.pinterest.com/person/board/"),
    "https://www.pinterest.com/person/board/",
  );
  assert.equal(
    pinterestUrl("https://pin.it/example"),
    "https://pin.it/example",
  );
  for (const v of [
    "https://pinterest.com.evil.com/x",
    "javascript:alert(1)",
    "http://pinterest.com/x",
    "https://evil.com/?pinterest.com",
    null,
  ])
    assert.equal(pinterestUrl(v), null);
});
test("CLABE checks both length and check digit without dropping leading zeros", () => {
  assert.equal(validClabe("032180000118359719"), true);
  assert.equal(validClabe("032180000118359718"), false);
  assert.equal(validClabe("32180000118359719"), false);
});
test("phone preserves country prefix and rejects incomplete or mixed input", () => {
  assert.equal(normalizePhone("+52 (55) 1234-5678"), "525512345678");
  assert.equal(validPhone("+52 (55) 1234-5678"), true);
  for (const v of ["123", "abc525512345678", "0000000000"])
    assert.equal(validPhone(v), false);
});
test("opening WhatsApp never removes a guest from pending and RSVP is independent", () => {
  assert.equal(
    guestMatches(
      { envio_estado: "por_verificar", estado: "confirmado" },
      "pendientes",
    ),
    true,
  );
  assert.equal(guestMatches({ envio_estado: "pendiente" }, "verificar"), false);
  assert.equal(
    guestMatches(
      { envio_estado: "enviada", estado: "pendiente" },
      "sin_respuesta",
    ),
    true,
  );
  assert.equal(
    guestMatches(
      { envio_estado: "enviada", estado: "confirmado" },
      "sin_respuesta",
    ),
    false,
  );
});
