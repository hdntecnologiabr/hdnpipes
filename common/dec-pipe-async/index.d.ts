type Context = any
type ActionFn = (ctx: Context) => Context;
type ErrorFn = (err: Error, ctx: Context) => Context

declare class Pipe {
    add(actionFn: ActionFn): Pipe;
    error(errorFn: ErrorFn): Pipe;
    run(ctx: Context): Context;    
}

export function pipe(): Pipe;