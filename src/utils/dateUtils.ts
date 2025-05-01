const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
};

export function currentTime(): string {
    return new Date().toLocaleString("pt-BR", options);
}

export function formatDate(date: string): string {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    if (!year || !month || !day) return date;

    return `${day}/${month}/${year}`;
}

export function addZeroToTime(time: number): string {
    return time < 10 ? `0${time}` : String(time);
}
