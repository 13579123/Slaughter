let id = 100000
export function generateId(code: string = Math.ceil(Date.now() / 100000000) + ''): string {
    const now = Date.now() % 100000
    return code + "-" + now + "-" + (id++) + Math.floor(Math.random() * 100000)
}