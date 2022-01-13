export const getRuntimeString = (runtime) => {
    if (!runtime) return '';
    const runtimeHours = Math.floor(runtime / 60);
    const runtimeMinutes = runtime % 60;

    if (runtimeHours && runtimeHours > 0) {
        return `${runtimeHours}h ${runtimeMinutes}m`;
    } else {
        return `${runtimeMinutes}m`;
    }
    // return runtimeHours > 0 ?? runtimeHours !== undefined ? `${runtimeHours}h ${runtimeMinutes}m` : `${runtimeMinutes}m`;
}