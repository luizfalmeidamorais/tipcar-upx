export const TZ_BR = "America/Sao_Paulo";

export function formatDateTimeBR(
  d: Date | string | number,
  opts?: Intl.DateTimeFormatOptions
) {
  const date = new Date(d);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ_BR,
    dateStyle: "short",
    timeStyle: "short",
    ...(opts ?? {}),
  }).format(date);
}
