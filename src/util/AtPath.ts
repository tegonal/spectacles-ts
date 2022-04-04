import { Some } from "fp-ts/Option";
import { Left, Right } from "fp-ts/Either";
import { FirstSegment, TailSegment, UnescapeParenthesis } from "./segments";

type Operation = "apply-traversals" | "no-traversals";

export type AtPath<A, Args extends string, Op extends Operation = "apply-traversals"> = unknown extends A
  ? unknown
  : Args extends ""
  ? A
  : Op extends "apply-traversals"
  ? ApplyTraversals<
      TailSegment<Args> extends ""
        ? ApplySegment<A, Args>
        : AtPath<ApplySegment<A, FirstSegment<Args>>, TailSegment<Args>, "no-traversals">,
      Args
    >
  : TailSegment<Args> extends ""
  ? ApplySegment<A, Args>
  : AtPath<ApplySegment<A, FirstSegment<Args>>, TailSegment<Args>, Op>;

export type ApplyTraversals<A, Args extends string> = Args extends ""
  ? A
  : FirstSegment<Args> extends `(${string}`
  ? ApplyTraversals<A, TailSegment<Args>>
  : FirstSegment<Args> extends "[]>"
  ? ApplyTraversals<A[], TailSegment<Args>>
  : FirstSegment<Args> extends "{}>"
  ? ApplyTraversals<Record<string, A>, TailSegment<Args>>
  : ApplyTraversals<A, TailSegment<Args>>;

type ApplySegment<A, Seg extends string> = Seg extends `(${string}`
  ? A[Extract<UnescapeParenthesis<Seg>, keyof A>]
  : Seg extends "?"
  ? NonNullable<A>
  : Seg extends "?some"
  ? Extract<A, Some<unknown>>["value"]
  : Seg extends "?left"
  ? Extract<A, Left<unknown>>["left"]
  : Seg extends "?right"
  ? Extract<A, Right<unknown>>["right"]
  : Seg extends "[]>" | "[number]"
  ? Extract<A, unknown[]>[number]
  : Seg extends "{}>" | "[string]"
  ? Extract<A, Record<string, unknown>>[string]
  : Seg extends `[${infer TupleIndex}]`
  ? A[Extract<TupleIndex, keyof A>]
  : Seg extends `${infer Discriminant}:${infer Member}`
  ? Extract<A, { [K in Discriminant]: Member }> extends never
    ? A[Extract<Seg, keyof A>]
    : Extract<A, { [K in Discriminant]: Member }>
  : A[Extract<Seg, keyof A>];
