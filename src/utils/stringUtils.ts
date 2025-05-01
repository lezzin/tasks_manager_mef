export function filterField(field: string) {
    return field.trim().replace(/[.[\]*`]/g, "");
}
