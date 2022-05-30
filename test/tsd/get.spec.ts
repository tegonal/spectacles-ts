import { expectType, expectError } from "tsd";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as Eq from "fp-ts/Eq";
import { Eq as StringEq } from "fp-ts/string";
import { get } from "../../src/values/get";
import { data, DataWithRecords, simpleData } from "../shared";

// gets a definite value
const definite = pipe(simpleData, get("a.b.[1]"));
expectType<string>(definite);

// gets an optional value
const optional = pipe(data, get("type:A.a.?some.c"));
expectType<O.Option<number>>(optional);
expectError<O.Option<never>>(optional);

// has checked record access
const record = { a: 123 } as Record<string, number>;
const picked2 = pipe(record, get("[string]", "b"));
expectType<O.Option<number>>(picked2);

// can traverse records
const records = {
  record: { a: 123 },
  recordWithKeys: { r1: 124, r2: 125 },
} as DataWithRecords;
const traverseRecord = pipe(records, get("record.{}>"));
const traverseRecordWithKeys = pipe(records, get("recordWithKeys.{}>"));
expectType<Record<string, number>>(traverseRecord);
expectType<Record<string, number>>(traverseRecordWithKeys);

// can traverse arrays
const traverseArray = pipe([{ a: 123 }, { a: 456 }], get("[]>.a"));
expectType<number[]>(traverseArray);

// gets an optional value - unpiped
const func = get("type:A.a.?some.c");
const optional2 = func(data);
expectType<O.Option<number>>(optional2);

const infersEq = pipe(StringEq, Eq.contramap(get("a.b")));
expectType<Eq.Eq<{ readonly a: { readonly b: string } }>>(infersEq);

const infersOptionalEq = pipe(O.getEq(StringEq), Eq.contramap(get("a.b?")));
expectType<Eq.Eq<{ readonly a: { readonly b: string | undefined | null } }>>(infersOptionalEq);

expectError<Eq.Eq<{ a: { b: string | undefined | null } }>>(pipe(StringEq, Eq.contramap(get("a.b?"))));

expectError<Eq.Eq<{ a: { b: string } }>>(pipe(O.getEq(StringEq), Eq.contramap(get("a.b"))));
