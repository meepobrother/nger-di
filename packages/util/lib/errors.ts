export const ERROR_TYPE = 'ngType';
export const ERROR_DEBUG_CONTEXT = 'ngDebugContext';
export const ERROR_ORIGINAL_ERROR = 'ngOriginalError';
export const ERROR_LOGGER = 'ngErrorLogger';


export function wrappedError(message: string, originalError: any): Error {
    const msg =
        `${message} caused by: ${originalError instanceof Error ? originalError.message : originalError}`;
    const error = Error(msg);
    (error as any)[ERROR_ORIGINAL_ERROR] = originalError;
    return error;
}
