
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model AnnotationScheme
 * 
 */
export type AnnotationScheme = $Result.DefaultSelection<Prisma.$AnnotationSchemePayload>
/**
 * Model Annotation
 * 
 */
export type Annotation = $Result.DefaultSelection<Prisma.$AnnotationPayload>
/**
 * Model DatasetVersion
 * 
 */
export type DatasetVersion = $Result.DefaultSelection<Prisma.$DatasetVersionPayload>
/**
 * Model Camera
 * 
 */
export type Camera = $Result.DefaultSelection<Prisma.$CameraPayload>
/**
 * Model TrainingRecord
 * 
 */
export type TrainingRecord = $Result.DefaultSelection<Prisma.$TrainingRecordPayload>
/**
 * Model AppSettings
 * 
 */
export type AppSettings = $Result.DefaultSelection<Prisma.$AppSettingsPayload>
/**
 * Model RoiImage
 * 
 */
export type RoiImage = $Result.DefaultSelection<Prisma.$RoiImagePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Products
 * const products = await prisma.product.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Products
   * const products = await prisma.product.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.annotationScheme`: Exposes CRUD operations for the **AnnotationScheme** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AnnotationSchemes
    * const annotationSchemes = await prisma.annotationScheme.findMany()
    * ```
    */
  get annotationScheme(): Prisma.AnnotationSchemeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.annotation`: Exposes CRUD operations for the **Annotation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Annotations
    * const annotations = await prisma.annotation.findMany()
    * ```
    */
  get annotation(): Prisma.AnnotationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.datasetVersion`: Exposes CRUD operations for the **DatasetVersion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DatasetVersions
    * const datasetVersions = await prisma.datasetVersion.findMany()
    * ```
    */
  get datasetVersion(): Prisma.DatasetVersionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.camera`: Exposes CRUD operations for the **Camera** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cameras
    * const cameras = await prisma.camera.findMany()
    * ```
    */
  get camera(): Prisma.CameraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.trainingRecord`: Exposes CRUD operations for the **TrainingRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrainingRecords
    * const trainingRecords = await prisma.trainingRecord.findMany()
    * ```
    */
  get trainingRecord(): Prisma.TrainingRecordDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.appSettings`: Exposes CRUD operations for the **AppSettings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppSettings
    * const appSettings = await prisma.appSettings.findMany()
    * ```
    */
  get appSettings(): Prisma.AppSettingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.roiImage`: Exposes CRUD operations for the **RoiImage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RoiImages
    * const roiImages = await prisma.roiImage.findMany()
    * ```
    */
  get roiImage(): Prisma.RoiImageDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Product: 'Product',
    AnnotationScheme: 'AnnotationScheme',
    Annotation: 'Annotation',
    DatasetVersion: 'DatasetVersion',
    Camera: 'Camera',
    TrainingRecord: 'TrainingRecord',
    AppSettings: 'AppSettings',
    RoiImage: 'RoiImage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "product" | "annotationScheme" | "annotation" | "datasetVersion" | "camera" | "trainingRecord" | "appSettings" | "roiImage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      AnnotationScheme: {
        payload: Prisma.$AnnotationSchemePayload<ExtArgs>
        fields: Prisma.AnnotationSchemeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnnotationSchemeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnnotationSchemeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>
          }
          findFirst: {
            args: Prisma.AnnotationSchemeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnnotationSchemeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>
          }
          findMany: {
            args: Prisma.AnnotationSchemeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>[]
          }
          create: {
            args: Prisma.AnnotationSchemeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>
          }
          createMany: {
            args: Prisma.AnnotationSchemeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnnotationSchemeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>[]
          }
          delete: {
            args: Prisma.AnnotationSchemeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>
          }
          update: {
            args: Prisma.AnnotationSchemeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>
          }
          deleteMany: {
            args: Prisma.AnnotationSchemeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnnotationSchemeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnnotationSchemeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>[]
          }
          upsert: {
            args: Prisma.AnnotationSchemeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationSchemePayload>
          }
          aggregate: {
            args: Prisma.AnnotationSchemeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnnotationScheme>
          }
          groupBy: {
            args: Prisma.AnnotationSchemeGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnnotationSchemeGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnnotationSchemeCountArgs<ExtArgs>
            result: $Utils.Optional<AnnotationSchemeCountAggregateOutputType> | number
          }
        }
      }
      Annotation: {
        payload: Prisma.$AnnotationPayload<ExtArgs>
        fields: Prisma.AnnotationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnnotationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnnotationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          findFirst: {
            args: Prisma.AnnotationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnnotationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          findMany: {
            args: Prisma.AnnotationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>[]
          }
          create: {
            args: Prisma.AnnotationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          createMany: {
            args: Prisma.AnnotationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnnotationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>[]
          }
          delete: {
            args: Prisma.AnnotationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          update: {
            args: Prisma.AnnotationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          deleteMany: {
            args: Prisma.AnnotationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnnotationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnnotationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>[]
          }
          upsert: {
            args: Prisma.AnnotationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          aggregate: {
            args: Prisma.AnnotationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnnotation>
          }
          groupBy: {
            args: Prisma.AnnotationGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnnotationGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnnotationCountArgs<ExtArgs>
            result: $Utils.Optional<AnnotationCountAggregateOutputType> | number
          }
        }
      }
      DatasetVersion: {
        payload: Prisma.$DatasetVersionPayload<ExtArgs>
        fields: Prisma.DatasetVersionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DatasetVersionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DatasetVersionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>
          }
          findFirst: {
            args: Prisma.DatasetVersionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DatasetVersionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>
          }
          findMany: {
            args: Prisma.DatasetVersionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>[]
          }
          create: {
            args: Prisma.DatasetVersionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>
          }
          createMany: {
            args: Prisma.DatasetVersionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DatasetVersionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>[]
          }
          delete: {
            args: Prisma.DatasetVersionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>
          }
          update: {
            args: Prisma.DatasetVersionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>
          }
          deleteMany: {
            args: Prisma.DatasetVersionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DatasetVersionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DatasetVersionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>[]
          }
          upsert: {
            args: Prisma.DatasetVersionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetVersionPayload>
          }
          aggregate: {
            args: Prisma.DatasetVersionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDatasetVersion>
          }
          groupBy: {
            args: Prisma.DatasetVersionGroupByArgs<ExtArgs>
            result: $Utils.Optional<DatasetVersionGroupByOutputType>[]
          }
          count: {
            args: Prisma.DatasetVersionCountArgs<ExtArgs>
            result: $Utils.Optional<DatasetVersionCountAggregateOutputType> | number
          }
        }
      }
      Camera: {
        payload: Prisma.$CameraPayload<ExtArgs>
        fields: Prisma.CameraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CameraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CameraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>
          }
          findFirst: {
            args: Prisma.CameraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CameraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>
          }
          findMany: {
            args: Prisma.CameraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>[]
          }
          create: {
            args: Prisma.CameraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>
          }
          createMany: {
            args: Prisma.CameraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CameraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>[]
          }
          delete: {
            args: Prisma.CameraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>
          }
          update: {
            args: Prisma.CameraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>
          }
          deleteMany: {
            args: Prisma.CameraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CameraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CameraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>[]
          }
          upsert: {
            args: Prisma.CameraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CameraPayload>
          }
          aggregate: {
            args: Prisma.CameraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCamera>
          }
          groupBy: {
            args: Prisma.CameraGroupByArgs<ExtArgs>
            result: $Utils.Optional<CameraGroupByOutputType>[]
          }
          count: {
            args: Prisma.CameraCountArgs<ExtArgs>
            result: $Utils.Optional<CameraCountAggregateOutputType> | number
          }
        }
      }
      TrainingRecord: {
        payload: Prisma.$TrainingRecordPayload<ExtArgs>
        fields: Prisma.TrainingRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrainingRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrainingRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          findFirst: {
            args: Prisma.TrainingRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrainingRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          findMany: {
            args: Prisma.TrainingRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>[]
          }
          create: {
            args: Prisma.TrainingRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          createMany: {
            args: Prisma.TrainingRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrainingRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>[]
          }
          delete: {
            args: Prisma.TrainingRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          update: {
            args: Prisma.TrainingRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          deleteMany: {
            args: Prisma.TrainingRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrainingRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TrainingRecordUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>[]
          }
          upsert: {
            args: Prisma.TrainingRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          aggregate: {
            args: Prisma.TrainingRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainingRecord>
          }
          groupBy: {
            args: Prisma.TrainingRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrainingRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrainingRecordCountArgs<ExtArgs>
            result: $Utils.Optional<TrainingRecordCountAggregateOutputType> | number
          }
        }
      }
      AppSettings: {
        payload: Prisma.$AppSettingsPayload<ExtArgs>
        fields: Prisma.AppSettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppSettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppSettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          findFirst: {
            args: Prisma.AppSettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppSettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          findMany: {
            args: Prisma.AppSettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>[]
          }
          create: {
            args: Prisma.AppSettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          createMany: {
            args: Prisma.AppSettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppSettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>[]
          }
          delete: {
            args: Prisma.AppSettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          update: {
            args: Prisma.AppSettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          deleteMany: {
            args: Prisma.AppSettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppSettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AppSettingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>[]
          }
          upsert: {
            args: Prisma.AppSettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          aggregate: {
            args: Prisma.AppSettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppSettings>
          }
          groupBy: {
            args: Prisma.AppSettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppSettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppSettingsCountArgs<ExtArgs>
            result: $Utils.Optional<AppSettingsCountAggregateOutputType> | number
          }
        }
      }
      RoiImage: {
        payload: Prisma.$RoiImagePayload<ExtArgs>
        fields: Prisma.RoiImageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoiImageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoiImageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>
          }
          findFirst: {
            args: Prisma.RoiImageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoiImageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>
          }
          findMany: {
            args: Prisma.RoiImageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>[]
          }
          create: {
            args: Prisma.RoiImageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>
          }
          createMany: {
            args: Prisma.RoiImageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoiImageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>[]
          }
          delete: {
            args: Prisma.RoiImageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>
          }
          update: {
            args: Prisma.RoiImageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>
          }
          deleteMany: {
            args: Prisma.RoiImageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoiImageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RoiImageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>[]
          }
          upsert: {
            args: Prisma.RoiImageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoiImagePayload>
          }
          aggregate: {
            args: Prisma.RoiImageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoiImage>
          }
          groupBy: {
            args: Prisma.RoiImageGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoiImageGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoiImageCountArgs<ExtArgs>
            result: $Utils.Optional<RoiImageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    product?: ProductOmit
    annotationScheme?: AnnotationSchemeOmit
    annotation?: AnnotationOmit
    datasetVersion?: DatasetVersionOmit
    camera?: CameraOmit
    trainingRecord?: TrainingRecordOmit
    appSettings?: AppSettingsOmit
    roiImage?: RoiImageOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    annotations: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    annotations?: boolean | ProductCountOutputTypeCountAnnotationsArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountAnnotationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnnotationWhereInput
  }


  /**
   * Count Type AnnotationSchemeCountOutputType
   */

  export type AnnotationSchemeCountOutputType = {
    products: number
  }

  export type AnnotationSchemeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | AnnotationSchemeCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * AnnotationSchemeCountOutputType without action
   */
  export type AnnotationSchemeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationSchemeCountOutputType
     */
    select?: AnnotationSchemeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AnnotationSchemeCountOutputType without action
   */
  export type AnnotationSchemeCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    name: string | null
    model: string | null
    lastImagePath: string | null
    cameraId: string | null
    schemeId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    name: string | null
    model: string | null
    lastImagePath: string | null
    cameraId: string | null
    schemeId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    name: number
    model: number
    lastImagePath: number
    cameraId: number
    schemeId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductMinAggregateInputType = {
    id?: true
    name?: true
    model?: true
    lastImagePath?: true
    cameraId?: true
    schemeId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    name?: true
    model?: true
    lastImagePath?: true
    cameraId?: true
    schemeId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    name?: true
    model?: true
    lastImagePath?: true
    cameraId?: true
    schemeId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    name: string
    model: string
    lastImagePath: string | null
    cameraId: string | null
    schemeId: string | null
    createdAt: Date
    updatedAt: Date
    _count: ProductCountAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    model?: boolean
    lastImagePath?: boolean
    cameraId?: boolean
    schemeId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    scheme?: boolean | Product$schemeArgs<ExtArgs>
    annotations?: boolean | Product$annotationsArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    model?: boolean
    lastImagePath?: boolean
    cameraId?: boolean
    schemeId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    scheme?: boolean | Product$schemeArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    model?: boolean
    lastImagePath?: boolean
    cameraId?: boolean
    schemeId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    scheme?: boolean | Product$schemeArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    name?: boolean
    model?: boolean
    lastImagePath?: boolean
    cameraId?: boolean
    schemeId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "model" | "lastImagePath" | "cameraId" | "schemeId" | "createdAt" | "updatedAt", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scheme?: boolean | Product$schemeArgs<ExtArgs>
    annotations?: boolean | Product$annotationsArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scheme?: boolean | Product$schemeArgs<ExtArgs>
  }
  export type ProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scheme?: boolean | Product$schemeArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      scheme: Prisma.$AnnotationSchemePayload<ExtArgs> | null
      annotations: Prisma.$AnnotationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      model: string
      lastImagePath: string | null
      cameraId: string | null
      schemeId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productWithIdOnly = await prisma.product.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    scheme<T extends Product$schemeArgs<ExtArgs> = {}>(args?: Subset<T, Product$schemeArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    annotations<T extends Product$annotationsArgs<ExtArgs> = {}>(args?: Subset<T, Product$annotationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly model: FieldRef<"Product", 'String'>
    readonly lastImagePath: FieldRef<"Product", 'String'>
    readonly cameraId: FieldRef<"Product", 'String'>
    readonly schemeId: FieldRef<"Product", 'String'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product.scheme
   */
  export type Product$schemeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    where?: AnnotationSchemeWhereInput
  }

  /**
   * Product.annotations
   */
  export type Product$annotationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    where?: AnnotationWhereInput
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    cursor?: AnnotationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnnotationScalarFieldEnum | AnnotationScalarFieldEnum[]
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model AnnotationScheme
   */

  export type AggregateAnnotationScheme = {
    _count: AnnotationSchemeCountAggregateOutputType | null
    _min: AnnotationSchemeMinAggregateOutputType | null
    _max: AnnotationSchemeMaxAggregateOutputType | null
  }

  export type AnnotationSchemeMinAggregateOutputType = {
    id: string | null
    name: string | null
    config: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AnnotationSchemeMaxAggregateOutputType = {
    id: string | null
    name: string | null
    config: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AnnotationSchemeCountAggregateOutputType = {
    id: number
    name: number
    config: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AnnotationSchemeMinAggregateInputType = {
    id?: true
    name?: true
    config?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AnnotationSchemeMaxAggregateInputType = {
    id?: true
    name?: true
    config?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AnnotationSchemeCountAggregateInputType = {
    id?: true
    name?: true
    config?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AnnotationSchemeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnnotationScheme to aggregate.
     */
    where?: AnnotationSchemeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnnotationSchemes to fetch.
     */
    orderBy?: AnnotationSchemeOrderByWithRelationInput | AnnotationSchemeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnnotationSchemeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnnotationSchemes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnnotationSchemes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AnnotationSchemes
    **/
    _count?: true | AnnotationSchemeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnnotationSchemeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnnotationSchemeMaxAggregateInputType
  }

  export type GetAnnotationSchemeAggregateType<T extends AnnotationSchemeAggregateArgs> = {
        [P in keyof T & keyof AggregateAnnotationScheme]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnnotationScheme[P]>
      : GetScalarType<T[P], AggregateAnnotationScheme[P]>
  }




  export type AnnotationSchemeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnnotationSchemeWhereInput
    orderBy?: AnnotationSchemeOrderByWithAggregationInput | AnnotationSchemeOrderByWithAggregationInput[]
    by: AnnotationSchemeScalarFieldEnum[] | AnnotationSchemeScalarFieldEnum
    having?: AnnotationSchemeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnnotationSchemeCountAggregateInputType | true
    _min?: AnnotationSchemeMinAggregateInputType
    _max?: AnnotationSchemeMaxAggregateInputType
  }

  export type AnnotationSchemeGroupByOutputType = {
    id: string
    name: string
    config: string
    createdAt: Date
    updatedAt: Date
    _count: AnnotationSchemeCountAggregateOutputType | null
    _min: AnnotationSchemeMinAggregateOutputType | null
    _max: AnnotationSchemeMaxAggregateOutputType | null
  }

  type GetAnnotationSchemeGroupByPayload<T extends AnnotationSchemeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnnotationSchemeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnnotationSchemeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnnotationSchemeGroupByOutputType[P]>
            : GetScalarType<T[P], AnnotationSchemeGroupByOutputType[P]>
        }
      >
    >


  export type AnnotationSchemeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    products?: boolean | AnnotationScheme$productsArgs<ExtArgs>
    _count?: boolean | AnnotationSchemeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["annotationScheme"]>

  export type AnnotationSchemeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["annotationScheme"]>

  export type AnnotationSchemeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["annotationScheme"]>

  export type AnnotationSchemeSelectScalar = {
    id?: boolean
    name?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AnnotationSchemeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "config" | "createdAt" | "updatedAt", ExtArgs["result"]["annotationScheme"]>
  export type AnnotationSchemeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | AnnotationScheme$productsArgs<ExtArgs>
    _count?: boolean | AnnotationSchemeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AnnotationSchemeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AnnotationSchemeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AnnotationSchemePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AnnotationScheme"
    objects: {
      products: Prisma.$ProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      config: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["annotationScheme"]>
    composites: {}
  }

  type AnnotationSchemeGetPayload<S extends boolean | null | undefined | AnnotationSchemeDefaultArgs> = $Result.GetResult<Prisma.$AnnotationSchemePayload, S>

  type AnnotationSchemeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnnotationSchemeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnnotationSchemeCountAggregateInputType | true
    }

  export interface AnnotationSchemeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AnnotationScheme'], meta: { name: 'AnnotationScheme' } }
    /**
     * Find zero or one AnnotationScheme that matches the filter.
     * @param {AnnotationSchemeFindUniqueArgs} args - Arguments to find a AnnotationScheme
     * @example
     * // Get one AnnotationScheme
     * const annotationScheme = await prisma.annotationScheme.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnnotationSchemeFindUniqueArgs>(args: SelectSubset<T, AnnotationSchemeFindUniqueArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AnnotationScheme that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnnotationSchemeFindUniqueOrThrowArgs} args - Arguments to find a AnnotationScheme
     * @example
     * // Get one AnnotationScheme
     * const annotationScheme = await prisma.annotationScheme.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnnotationSchemeFindUniqueOrThrowArgs>(args: SelectSubset<T, AnnotationSchemeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnnotationScheme that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationSchemeFindFirstArgs} args - Arguments to find a AnnotationScheme
     * @example
     * // Get one AnnotationScheme
     * const annotationScheme = await prisma.annotationScheme.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnnotationSchemeFindFirstArgs>(args?: SelectSubset<T, AnnotationSchemeFindFirstArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnnotationScheme that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationSchemeFindFirstOrThrowArgs} args - Arguments to find a AnnotationScheme
     * @example
     * // Get one AnnotationScheme
     * const annotationScheme = await prisma.annotationScheme.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnnotationSchemeFindFirstOrThrowArgs>(args?: SelectSubset<T, AnnotationSchemeFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AnnotationSchemes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationSchemeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnnotationSchemes
     * const annotationSchemes = await prisma.annotationScheme.findMany()
     * 
     * // Get first 10 AnnotationSchemes
     * const annotationSchemes = await prisma.annotationScheme.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const annotationSchemeWithIdOnly = await prisma.annotationScheme.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnnotationSchemeFindManyArgs>(args?: SelectSubset<T, AnnotationSchemeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AnnotationScheme.
     * @param {AnnotationSchemeCreateArgs} args - Arguments to create a AnnotationScheme.
     * @example
     * // Create one AnnotationScheme
     * const AnnotationScheme = await prisma.annotationScheme.create({
     *   data: {
     *     // ... data to create a AnnotationScheme
     *   }
     * })
     * 
     */
    create<T extends AnnotationSchemeCreateArgs>(args: SelectSubset<T, AnnotationSchemeCreateArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AnnotationSchemes.
     * @param {AnnotationSchemeCreateManyArgs} args - Arguments to create many AnnotationSchemes.
     * @example
     * // Create many AnnotationSchemes
     * const annotationScheme = await prisma.annotationScheme.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnnotationSchemeCreateManyArgs>(args?: SelectSubset<T, AnnotationSchemeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AnnotationSchemes and returns the data saved in the database.
     * @param {AnnotationSchemeCreateManyAndReturnArgs} args - Arguments to create many AnnotationSchemes.
     * @example
     * // Create many AnnotationSchemes
     * const annotationScheme = await prisma.annotationScheme.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AnnotationSchemes and only return the `id`
     * const annotationSchemeWithIdOnly = await prisma.annotationScheme.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnnotationSchemeCreateManyAndReturnArgs>(args?: SelectSubset<T, AnnotationSchemeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AnnotationScheme.
     * @param {AnnotationSchemeDeleteArgs} args - Arguments to delete one AnnotationScheme.
     * @example
     * // Delete one AnnotationScheme
     * const AnnotationScheme = await prisma.annotationScheme.delete({
     *   where: {
     *     // ... filter to delete one AnnotationScheme
     *   }
     * })
     * 
     */
    delete<T extends AnnotationSchemeDeleteArgs>(args: SelectSubset<T, AnnotationSchemeDeleteArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AnnotationScheme.
     * @param {AnnotationSchemeUpdateArgs} args - Arguments to update one AnnotationScheme.
     * @example
     * // Update one AnnotationScheme
     * const annotationScheme = await prisma.annotationScheme.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnnotationSchemeUpdateArgs>(args: SelectSubset<T, AnnotationSchemeUpdateArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AnnotationSchemes.
     * @param {AnnotationSchemeDeleteManyArgs} args - Arguments to filter AnnotationSchemes to delete.
     * @example
     * // Delete a few AnnotationSchemes
     * const { count } = await prisma.annotationScheme.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnnotationSchemeDeleteManyArgs>(args?: SelectSubset<T, AnnotationSchemeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnnotationSchemes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationSchemeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AnnotationSchemes
     * const annotationScheme = await prisma.annotationScheme.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnnotationSchemeUpdateManyArgs>(args: SelectSubset<T, AnnotationSchemeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnnotationSchemes and returns the data updated in the database.
     * @param {AnnotationSchemeUpdateManyAndReturnArgs} args - Arguments to update many AnnotationSchemes.
     * @example
     * // Update many AnnotationSchemes
     * const annotationScheme = await prisma.annotationScheme.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AnnotationSchemes and only return the `id`
     * const annotationSchemeWithIdOnly = await prisma.annotationScheme.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnnotationSchemeUpdateManyAndReturnArgs>(args: SelectSubset<T, AnnotationSchemeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AnnotationScheme.
     * @param {AnnotationSchemeUpsertArgs} args - Arguments to update or create a AnnotationScheme.
     * @example
     * // Update or create a AnnotationScheme
     * const annotationScheme = await prisma.annotationScheme.upsert({
     *   create: {
     *     // ... data to create a AnnotationScheme
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AnnotationScheme we want to update
     *   }
     * })
     */
    upsert<T extends AnnotationSchemeUpsertArgs>(args: SelectSubset<T, AnnotationSchemeUpsertArgs<ExtArgs>>): Prisma__AnnotationSchemeClient<$Result.GetResult<Prisma.$AnnotationSchemePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AnnotationSchemes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationSchemeCountArgs} args - Arguments to filter AnnotationSchemes to count.
     * @example
     * // Count the number of AnnotationSchemes
     * const count = await prisma.annotationScheme.count({
     *   where: {
     *     // ... the filter for the AnnotationSchemes we want to count
     *   }
     * })
    **/
    count<T extends AnnotationSchemeCountArgs>(
      args?: Subset<T, AnnotationSchemeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnnotationSchemeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AnnotationScheme.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationSchemeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnnotationSchemeAggregateArgs>(args: Subset<T, AnnotationSchemeAggregateArgs>): Prisma.PrismaPromise<GetAnnotationSchemeAggregateType<T>>

    /**
     * Group by AnnotationScheme.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationSchemeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnnotationSchemeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnnotationSchemeGroupByArgs['orderBy'] }
        : { orderBy?: AnnotationSchemeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnnotationSchemeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnnotationSchemeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AnnotationScheme model
   */
  readonly fields: AnnotationSchemeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AnnotationScheme.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnnotationSchemeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    products<T extends AnnotationScheme$productsArgs<ExtArgs> = {}>(args?: Subset<T, AnnotationScheme$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AnnotationScheme model
   */
  interface AnnotationSchemeFieldRefs {
    readonly id: FieldRef<"AnnotationScheme", 'String'>
    readonly name: FieldRef<"AnnotationScheme", 'String'>
    readonly config: FieldRef<"AnnotationScheme", 'String'>
    readonly createdAt: FieldRef<"AnnotationScheme", 'DateTime'>
    readonly updatedAt: FieldRef<"AnnotationScheme", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AnnotationScheme findUnique
   */
  export type AnnotationSchemeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * Filter, which AnnotationScheme to fetch.
     */
    where: AnnotationSchemeWhereUniqueInput
  }

  /**
   * AnnotationScheme findUniqueOrThrow
   */
  export type AnnotationSchemeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * Filter, which AnnotationScheme to fetch.
     */
    where: AnnotationSchemeWhereUniqueInput
  }

  /**
   * AnnotationScheme findFirst
   */
  export type AnnotationSchemeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * Filter, which AnnotationScheme to fetch.
     */
    where?: AnnotationSchemeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnnotationSchemes to fetch.
     */
    orderBy?: AnnotationSchemeOrderByWithRelationInput | AnnotationSchemeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnnotationSchemes.
     */
    cursor?: AnnotationSchemeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnnotationSchemes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnnotationSchemes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnnotationSchemes.
     */
    distinct?: AnnotationSchemeScalarFieldEnum | AnnotationSchemeScalarFieldEnum[]
  }

  /**
   * AnnotationScheme findFirstOrThrow
   */
  export type AnnotationSchemeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * Filter, which AnnotationScheme to fetch.
     */
    where?: AnnotationSchemeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnnotationSchemes to fetch.
     */
    orderBy?: AnnotationSchemeOrderByWithRelationInput | AnnotationSchemeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnnotationSchemes.
     */
    cursor?: AnnotationSchemeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnnotationSchemes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnnotationSchemes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnnotationSchemes.
     */
    distinct?: AnnotationSchemeScalarFieldEnum | AnnotationSchemeScalarFieldEnum[]
  }

  /**
   * AnnotationScheme findMany
   */
  export type AnnotationSchemeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * Filter, which AnnotationSchemes to fetch.
     */
    where?: AnnotationSchemeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnnotationSchemes to fetch.
     */
    orderBy?: AnnotationSchemeOrderByWithRelationInput | AnnotationSchemeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AnnotationSchemes.
     */
    cursor?: AnnotationSchemeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnnotationSchemes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnnotationSchemes.
     */
    skip?: number
    distinct?: AnnotationSchemeScalarFieldEnum | AnnotationSchemeScalarFieldEnum[]
  }

  /**
   * AnnotationScheme create
   */
  export type AnnotationSchemeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * The data needed to create a AnnotationScheme.
     */
    data: XOR<AnnotationSchemeCreateInput, AnnotationSchemeUncheckedCreateInput>
  }

  /**
   * AnnotationScheme createMany
   */
  export type AnnotationSchemeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AnnotationSchemes.
     */
    data: AnnotationSchemeCreateManyInput | AnnotationSchemeCreateManyInput[]
  }

  /**
   * AnnotationScheme createManyAndReturn
   */
  export type AnnotationSchemeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * The data used to create many AnnotationSchemes.
     */
    data: AnnotationSchemeCreateManyInput | AnnotationSchemeCreateManyInput[]
  }

  /**
   * AnnotationScheme update
   */
  export type AnnotationSchemeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * The data needed to update a AnnotationScheme.
     */
    data: XOR<AnnotationSchemeUpdateInput, AnnotationSchemeUncheckedUpdateInput>
    /**
     * Choose, which AnnotationScheme to update.
     */
    where: AnnotationSchemeWhereUniqueInput
  }

  /**
   * AnnotationScheme updateMany
   */
  export type AnnotationSchemeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AnnotationSchemes.
     */
    data: XOR<AnnotationSchemeUpdateManyMutationInput, AnnotationSchemeUncheckedUpdateManyInput>
    /**
     * Filter which AnnotationSchemes to update
     */
    where?: AnnotationSchemeWhereInput
    /**
     * Limit how many AnnotationSchemes to update.
     */
    limit?: number
  }

  /**
   * AnnotationScheme updateManyAndReturn
   */
  export type AnnotationSchemeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * The data used to update AnnotationSchemes.
     */
    data: XOR<AnnotationSchemeUpdateManyMutationInput, AnnotationSchemeUncheckedUpdateManyInput>
    /**
     * Filter which AnnotationSchemes to update
     */
    where?: AnnotationSchemeWhereInput
    /**
     * Limit how many AnnotationSchemes to update.
     */
    limit?: number
  }

  /**
   * AnnotationScheme upsert
   */
  export type AnnotationSchemeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * The filter to search for the AnnotationScheme to update in case it exists.
     */
    where: AnnotationSchemeWhereUniqueInput
    /**
     * In case the AnnotationScheme found by the `where` argument doesn't exist, create a new AnnotationScheme with this data.
     */
    create: XOR<AnnotationSchemeCreateInput, AnnotationSchemeUncheckedCreateInput>
    /**
     * In case the AnnotationScheme was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnnotationSchemeUpdateInput, AnnotationSchemeUncheckedUpdateInput>
  }

  /**
   * AnnotationScheme delete
   */
  export type AnnotationSchemeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
    /**
     * Filter which AnnotationScheme to delete.
     */
    where: AnnotationSchemeWhereUniqueInput
  }

  /**
   * AnnotationScheme deleteMany
   */
  export type AnnotationSchemeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnnotationSchemes to delete
     */
    where?: AnnotationSchemeWhereInput
    /**
     * Limit how many AnnotationSchemes to delete.
     */
    limit?: number
  }

  /**
   * AnnotationScheme.products
   */
  export type AnnotationScheme$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * AnnotationScheme without action
   */
  export type AnnotationSchemeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnnotationScheme
     */
    select?: AnnotationSchemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnnotationScheme
     */
    omit?: AnnotationSchemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationSchemeInclude<ExtArgs> | null
  }


  /**
   * Model Annotation
   */

  export type AggregateAnnotation = {
    _count: AnnotationCountAggregateOutputType | null
    _min: AnnotationMinAggregateOutputType | null
    _max: AnnotationMaxAggregateOutputType | null
  }

  export type AnnotationMinAggregateOutputType = {
    id: string | null
    productId: string | null
    imagePath: string | null
    data: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AnnotationMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    imagePath: string | null
    data: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AnnotationCountAggregateOutputType = {
    id: number
    productId: number
    imagePath: number
    data: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AnnotationMinAggregateInputType = {
    id?: true
    productId?: true
    imagePath?: true
    data?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AnnotationMaxAggregateInputType = {
    id?: true
    productId?: true
    imagePath?: true
    data?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AnnotationCountAggregateInputType = {
    id?: true
    productId?: true
    imagePath?: true
    data?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AnnotationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Annotation to aggregate.
     */
    where?: AnnotationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Annotations to fetch.
     */
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnnotationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Annotations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Annotations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Annotations
    **/
    _count?: true | AnnotationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnnotationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnnotationMaxAggregateInputType
  }

  export type GetAnnotationAggregateType<T extends AnnotationAggregateArgs> = {
        [P in keyof T & keyof AggregateAnnotation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnnotation[P]>
      : GetScalarType<T[P], AggregateAnnotation[P]>
  }




  export type AnnotationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnnotationWhereInput
    orderBy?: AnnotationOrderByWithAggregationInput | AnnotationOrderByWithAggregationInput[]
    by: AnnotationScalarFieldEnum[] | AnnotationScalarFieldEnum
    having?: AnnotationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnnotationCountAggregateInputType | true
    _min?: AnnotationMinAggregateInputType
    _max?: AnnotationMaxAggregateInputType
  }

  export type AnnotationGroupByOutputType = {
    id: string
    productId: string
    imagePath: string
    data: string
    createdAt: Date
    updatedAt: Date
    _count: AnnotationCountAggregateOutputType | null
    _min: AnnotationMinAggregateOutputType | null
    _max: AnnotationMaxAggregateOutputType | null
  }

  type GetAnnotationGroupByPayload<T extends AnnotationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnnotationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnnotationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnnotationGroupByOutputType[P]>
            : GetScalarType<T[P], AnnotationGroupByOutputType[P]>
        }
      >
    >


  export type AnnotationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    imagePath?: boolean
    data?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["annotation"]>

  export type AnnotationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    imagePath?: boolean
    data?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["annotation"]>

  export type AnnotationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    imagePath?: boolean
    data?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["annotation"]>

  export type AnnotationSelectScalar = {
    id?: boolean
    productId?: boolean
    imagePath?: boolean
    data?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AnnotationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "productId" | "imagePath" | "data" | "createdAt" | "updatedAt", ExtArgs["result"]["annotation"]>
  export type AnnotationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type AnnotationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type AnnotationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $AnnotationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Annotation"
    objects: {
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      imagePath: string
      data: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["annotation"]>
    composites: {}
  }

  type AnnotationGetPayload<S extends boolean | null | undefined | AnnotationDefaultArgs> = $Result.GetResult<Prisma.$AnnotationPayload, S>

  type AnnotationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnnotationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnnotationCountAggregateInputType | true
    }

  export interface AnnotationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Annotation'], meta: { name: 'Annotation' } }
    /**
     * Find zero or one Annotation that matches the filter.
     * @param {AnnotationFindUniqueArgs} args - Arguments to find a Annotation
     * @example
     * // Get one Annotation
     * const annotation = await prisma.annotation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnnotationFindUniqueArgs>(args: SelectSubset<T, AnnotationFindUniqueArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Annotation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnnotationFindUniqueOrThrowArgs} args - Arguments to find a Annotation
     * @example
     * // Get one Annotation
     * const annotation = await prisma.annotation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnnotationFindUniqueOrThrowArgs>(args: SelectSubset<T, AnnotationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Annotation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationFindFirstArgs} args - Arguments to find a Annotation
     * @example
     * // Get one Annotation
     * const annotation = await prisma.annotation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnnotationFindFirstArgs>(args?: SelectSubset<T, AnnotationFindFirstArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Annotation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationFindFirstOrThrowArgs} args - Arguments to find a Annotation
     * @example
     * // Get one Annotation
     * const annotation = await prisma.annotation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnnotationFindFirstOrThrowArgs>(args?: SelectSubset<T, AnnotationFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Annotations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Annotations
     * const annotations = await prisma.annotation.findMany()
     * 
     * // Get first 10 Annotations
     * const annotations = await prisma.annotation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const annotationWithIdOnly = await prisma.annotation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnnotationFindManyArgs>(args?: SelectSubset<T, AnnotationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Annotation.
     * @param {AnnotationCreateArgs} args - Arguments to create a Annotation.
     * @example
     * // Create one Annotation
     * const Annotation = await prisma.annotation.create({
     *   data: {
     *     // ... data to create a Annotation
     *   }
     * })
     * 
     */
    create<T extends AnnotationCreateArgs>(args: SelectSubset<T, AnnotationCreateArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Annotations.
     * @param {AnnotationCreateManyArgs} args - Arguments to create many Annotations.
     * @example
     * // Create many Annotations
     * const annotation = await prisma.annotation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnnotationCreateManyArgs>(args?: SelectSubset<T, AnnotationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Annotations and returns the data saved in the database.
     * @param {AnnotationCreateManyAndReturnArgs} args - Arguments to create many Annotations.
     * @example
     * // Create many Annotations
     * const annotation = await prisma.annotation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Annotations and only return the `id`
     * const annotationWithIdOnly = await prisma.annotation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnnotationCreateManyAndReturnArgs>(args?: SelectSubset<T, AnnotationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Annotation.
     * @param {AnnotationDeleteArgs} args - Arguments to delete one Annotation.
     * @example
     * // Delete one Annotation
     * const Annotation = await prisma.annotation.delete({
     *   where: {
     *     // ... filter to delete one Annotation
     *   }
     * })
     * 
     */
    delete<T extends AnnotationDeleteArgs>(args: SelectSubset<T, AnnotationDeleteArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Annotation.
     * @param {AnnotationUpdateArgs} args - Arguments to update one Annotation.
     * @example
     * // Update one Annotation
     * const annotation = await prisma.annotation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnnotationUpdateArgs>(args: SelectSubset<T, AnnotationUpdateArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Annotations.
     * @param {AnnotationDeleteManyArgs} args - Arguments to filter Annotations to delete.
     * @example
     * // Delete a few Annotations
     * const { count } = await prisma.annotation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnnotationDeleteManyArgs>(args?: SelectSubset<T, AnnotationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Annotations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Annotations
     * const annotation = await prisma.annotation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnnotationUpdateManyArgs>(args: SelectSubset<T, AnnotationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Annotations and returns the data updated in the database.
     * @param {AnnotationUpdateManyAndReturnArgs} args - Arguments to update many Annotations.
     * @example
     * // Update many Annotations
     * const annotation = await prisma.annotation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Annotations and only return the `id`
     * const annotationWithIdOnly = await prisma.annotation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnnotationUpdateManyAndReturnArgs>(args: SelectSubset<T, AnnotationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Annotation.
     * @param {AnnotationUpsertArgs} args - Arguments to update or create a Annotation.
     * @example
     * // Update or create a Annotation
     * const annotation = await prisma.annotation.upsert({
     *   create: {
     *     // ... data to create a Annotation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Annotation we want to update
     *   }
     * })
     */
    upsert<T extends AnnotationUpsertArgs>(args: SelectSubset<T, AnnotationUpsertArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Annotations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationCountArgs} args - Arguments to filter Annotations to count.
     * @example
     * // Count the number of Annotations
     * const count = await prisma.annotation.count({
     *   where: {
     *     // ... the filter for the Annotations we want to count
     *   }
     * })
    **/
    count<T extends AnnotationCountArgs>(
      args?: Subset<T, AnnotationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnnotationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Annotation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnnotationAggregateArgs>(args: Subset<T, AnnotationAggregateArgs>): Prisma.PrismaPromise<GetAnnotationAggregateType<T>>

    /**
     * Group by Annotation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnnotationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnnotationGroupByArgs['orderBy'] }
        : { orderBy?: AnnotationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnnotationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnnotationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Annotation model
   */
  readonly fields: AnnotationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Annotation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnnotationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Annotation model
   */
  interface AnnotationFieldRefs {
    readonly id: FieldRef<"Annotation", 'String'>
    readonly productId: FieldRef<"Annotation", 'String'>
    readonly imagePath: FieldRef<"Annotation", 'String'>
    readonly data: FieldRef<"Annotation", 'String'>
    readonly createdAt: FieldRef<"Annotation", 'DateTime'>
    readonly updatedAt: FieldRef<"Annotation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Annotation findUnique
   */
  export type AnnotationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotation to fetch.
     */
    where: AnnotationWhereUniqueInput
  }

  /**
   * Annotation findUniqueOrThrow
   */
  export type AnnotationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotation to fetch.
     */
    where: AnnotationWhereUniqueInput
  }

  /**
   * Annotation findFirst
   */
  export type AnnotationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotation to fetch.
     */
    where?: AnnotationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Annotations to fetch.
     */
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Annotations.
     */
    cursor?: AnnotationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Annotations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Annotations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Annotations.
     */
    distinct?: AnnotationScalarFieldEnum | AnnotationScalarFieldEnum[]
  }

  /**
   * Annotation findFirstOrThrow
   */
  export type AnnotationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotation to fetch.
     */
    where?: AnnotationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Annotations to fetch.
     */
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Annotations.
     */
    cursor?: AnnotationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Annotations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Annotations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Annotations.
     */
    distinct?: AnnotationScalarFieldEnum | AnnotationScalarFieldEnum[]
  }

  /**
   * Annotation findMany
   */
  export type AnnotationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotations to fetch.
     */
    where?: AnnotationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Annotations to fetch.
     */
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Annotations.
     */
    cursor?: AnnotationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Annotations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Annotations.
     */
    skip?: number
    distinct?: AnnotationScalarFieldEnum | AnnotationScalarFieldEnum[]
  }

  /**
   * Annotation create
   */
  export type AnnotationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * The data needed to create a Annotation.
     */
    data: XOR<AnnotationCreateInput, AnnotationUncheckedCreateInput>
  }

  /**
   * Annotation createMany
   */
  export type AnnotationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Annotations.
     */
    data: AnnotationCreateManyInput | AnnotationCreateManyInput[]
  }

  /**
   * Annotation createManyAndReturn
   */
  export type AnnotationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * The data used to create many Annotations.
     */
    data: AnnotationCreateManyInput | AnnotationCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Annotation update
   */
  export type AnnotationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * The data needed to update a Annotation.
     */
    data: XOR<AnnotationUpdateInput, AnnotationUncheckedUpdateInput>
    /**
     * Choose, which Annotation to update.
     */
    where: AnnotationWhereUniqueInput
  }

  /**
   * Annotation updateMany
   */
  export type AnnotationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Annotations.
     */
    data: XOR<AnnotationUpdateManyMutationInput, AnnotationUncheckedUpdateManyInput>
    /**
     * Filter which Annotations to update
     */
    where?: AnnotationWhereInput
    /**
     * Limit how many Annotations to update.
     */
    limit?: number
  }

  /**
   * Annotation updateManyAndReturn
   */
  export type AnnotationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * The data used to update Annotations.
     */
    data: XOR<AnnotationUpdateManyMutationInput, AnnotationUncheckedUpdateManyInput>
    /**
     * Filter which Annotations to update
     */
    where?: AnnotationWhereInput
    /**
     * Limit how many Annotations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Annotation upsert
   */
  export type AnnotationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * The filter to search for the Annotation to update in case it exists.
     */
    where: AnnotationWhereUniqueInput
    /**
     * In case the Annotation found by the `where` argument doesn't exist, create a new Annotation with this data.
     */
    create: XOR<AnnotationCreateInput, AnnotationUncheckedCreateInput>
    /**
     * In case the Annotation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnnotationUpdateInput, AnnotationUncheckedUpdateInput>
  }

  /**
   * Annotation delete
   */
  export type AnnotationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter which Annotation to delete.
     */
    where: AnnotationWhereUniqueInput
  }

  /**
   * Annotation deleteMany
   */
  export type AnnotationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Annotations to delete
     */
    where?: AnnotationWhereInput
    /**
     * Limit how many Annotations to delete.
     */
    limit?: number
  }

  /**
   * Annotation without action
   */
  export type AnnotationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
  }


  /**
   * Model DatasetVersion
   */

  export type AggregateDatasetVersion = {
    _count: DatasetVersionCountAggregateOutputType | null
    _avg: DatasetVersionAvgAggregateOutputType | null
    _sum: DatasetVersionSumAggregateOutputType | null
    _min: DatasetVersionMinAggregateOutputType | null
    _max: DatasetVersionMaxAggregateOutputType | null
  }

  export type DatasetVersionAvgAggregateOutputType = {
    imageCount: number | null
  }

  export type DatasetVersionSumAggregateOutputType = {
    imageCount: number | null
  }

  export type DatasetVersionMinAggregateOutputType = {
    id: string | null
    productId: string | null
    displayName: string | null
    versionName: string | null
    moduleName: string | null
    savePath: string | null
    imageCount: number | null
    config: string | null
    createdAt: Date | null
  }

  export type DatasetVersionMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    displayName: string | null
    versionName: string | null
    moduleName: string | null
    savePath: string | null
    imageCount: number | null
    config: string | null
    createdAt: Date | null
  }

  export type DatasetVersionCountAggregateOutputType = {
    id: number
    productId: number
    displayName: number
    versionName: number
    moduleName: number
    savePath: number
    imageCount: number
    config: number
    createdAt: number
    _all: number
  }


  export type DatasetVersionAvgAggregateInputType = {
    imageCount?: true
  }

  export type DatasetVersionSumAggregateInputType = {
    imageCount?: true
  }

  export type DatasetVersionMinAggregateInputType = {
    id?: true
    productId?: true
    displayName?: true
    versionName?: true
    moduleName?: true
    savePath?: true
    imageCount?: true
    config?: true
    createdAt?: true
  }

  export type DatasetVersionMaxAggregateInputType = {
    id?: true
    productId?: true
    displayName?: true
    versionName?: true
    moduleName?: true
    savePath?: true
    imageCount?: true
    config?: true
    createdAt?: true
  }

  export type DatasetVersionCountAggregateInputType = {
    id?: true
    productId?: true
    displayName?: true
    versionName?: true
    moduleName?: true
    savePath?: true
    imageCount?: true
    config?: true
    createdAt?: true
    _all?: true
  }

  export type DatasetVersionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatasetVersion to aggregate.
     */
    where?: DatasetVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatasetVersions to fetch.
     */
    orderBy?: DatasetVersionOrderByWithRelationInput | DatasetVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DatasetVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatasetVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatasetVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DatasetVersions
    **/
    _count?: true | DatasetVersionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DatasetVersionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DatasetVersionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DatasetVersionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DatasetVersionMaxAggregateInputType
  }

  export type GetDatasetVersionAggregateType<T extends DatasetVersionAggregateArgs> = {
        [P in keyof T & keyof AggregateDatasetVersion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDatasetVersion[P]>
      : GetScalarType<T[P], AggregateDatasetVersion[P]>
  }




  export type DatasetVersionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DatasetVersionWhereInput
    orderBy?: DatasetVersionOrderByWithAggregationInput | DatasetVersionOrderByWithAggregationInput[]
    by: DatasetVersionScalarFieldEnum[] | DatasetVersionScalarFieldEnum
    having?: DatasetVersionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DatasetVersionCountAggregateInputType | true
    _avg?: DatasetVersionAvgAggregateInputType
    _sum?: DatasetVersionSumAggregateInputType
    _min?: DatasetVersionMinAggregateInputType
    _max?: DatasetVersionMaxAggregateInputType
  }

  export type DatasetVersionGroupByOutputType = {
    id: string
    productId: string
    displayName: string
    versionName: string
    moduleName: string
    savePath: string
    imageCount: number
    config: string
    createdAt: Date
    _count: DatasetVersionCountAggregateOutputType | null
    _avg: DatasetVersionAvgAggregateOutputType | null
    _sum: DatasetVersionSumAggregateOutputType | null
    _min: DatasetVersionMinAggregateOutputType | null
    _max: DatasetVersionMaxAggregateOutputType | null
  }

  type GetDatasetVersionGroupByPayload<T extends DatasetVersionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DatasetVersionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DatasetVersionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DatasetVersionGroupByOutputType[P]>
            : GetScalarType<T[P], DatasetVersionGroupByOutputType[P]>
        }
      >
    >


  export type DatasetVersionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    displayName?: boolean
    versionName?: boolean
    moduleName?: boolean
    savePath?: boolean
    imageCount?: boolean
    config?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["datasetVersion"]>

  export type DatasetVersionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    displayName?: boolean
    versionName?: boolean
    moduleName?: boolean
    savePath?: boolean
    imageCount?: boolean
    config?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["datasetVersion"]>

  export type DatasetVersionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    displayName?: boolean
    versionName?: boolean
    moduleName?: boolean
    savePath?: boolean
    imageCount?: boolean
    config?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["datasetVersion"]>

  export type DatasetVersionSelectScalar = {
    id?: boolean
    productId?: boolean
    displayName?: boolean
    versionName?: boolean
    moduleName?: boolean
    savePath?: boolean
    imageCount?: boolean
    config?: boolean
    createdAt?: boolean
  }

  export type DatasetVersionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "productId" | "displayName" | "versionName" | "moduleName" | "savePath" | "imageCount" | "config" | "createdAt", ExtArgs["result"]["datasetVersion"]>

  export type $DatasetVersionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DatasetVersion"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      displayName: string
      versionName: string
      moduleName: string
      savePath: string
      imageCount: number
      config: string
      createdAt: Date
    }, ExtArgs["result"]["datasetVersion"]>
    composites: {}
  }

  type DatasetVersionGetPayload<S extends boolean | null | undefined | DatasetVersionDefaultArgs> = $Result.GetResult<Prisma.$DatasetVersionPayload, S>

  type DatasetVersionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DatasetVersionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DatasetVersionCountAggregateInputType | true
    }

  export interface DatasetVersionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DatasetVersion'], meta: { name: 'DatasetVersion' } }
    /**
     * Find zero or one DatasetVersion that matches the filter.
     * @param {DatasetVersionFindUniqueArgs} args - Arguments to find a DatasetVersion
     * @example
     * // Get one DatasetVersion
     * const datasetVersion = await prisma.datasetVersion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DatasetVersionFindUniqueArgs>(args: SelectSubset<T, DatasetVersionFindUniqueArgs<ExtArgs>>): Prisma__DatasetVersionClient<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DatasetVersion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DatasetVersionFindUniqueOrThrowArgs} args - Arguments to find a DatasetVersion
     * @example
     * // Get one DatasetVersion
     * const datasetVersion = await prisma.datasetVersion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DatasetVersionFindUniqueOrThrowArgs>(args: SelectSubset<T, DatasetVersionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DatasetVersionClient<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatasetVersion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetVersionFindFirstArgs} args - Arguments to find a DatasetVersion
     * @example
     * // Get one DatasetVersion
     * const datasetVersion = await prisma.datasetVersion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DatasetVersionFindFirstArgs>(args?: SelectSubset<T, DatasetVersionFindFirstArgs<ExtArgs>>): Prisma__DatasetVersionClient<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatasetVersion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetVersionFindFirstOrThrowArgs} args - Arguments to find a DatasetVersion
     * @example
     * // Get one DatasetVersion
     * const datasetVersion = await prisma.datasetVersion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DatasetVersionFindFirstOrThrowArgs>(args?: SelectSubset<T, DatasetVersionFindFirstOrThrowArgs<ExtArgs>>): Prisma__DatasetVersionClient<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DatasetVersions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetVersionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DatasetVersions
     * const datasetVersions = await prisma.datasetVersion.findMany()
     * 
     * // Get first 10 DatasetVersions
     * const datasetVersions = await prisma.datasetVersion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const datasetVersionWithIdOnly = await prisma.datasetVersion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DatasetVersionFindManyArgs>(args?: SelectSubset<T, DatasetVersionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DatasetVersion.
     * @param {DatasetVersionCreateArgs} args - Arguments to create a DatasetVersion.
     * @example
     * // Create one DatasetVersion
     * const DatasetVersion = await prisma.datasetVersion.create({
     *   data: {
     *     // ... data to create a DatasetVersion
     *   }
     * })
     * 
     */
    create<T extends DatasetVersionCreateArgs>(args: SelectSubset<T, DatasetVersionCreateArgs<ExtArgs>>): Prisma__DatasetVersionClient<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DatasetVersions.
     * @param {DatasetVersionCreateManyArgs} args - Arguments to create many DatasetVersions.
     * @example
     * // Create many DatasetVersions
     * const datasetVersion = await prisma.datasetVersion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DatasetVersionCreateManyArgs>(args?: SelectSubset<T, DatasetVersionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DatasetVersions and returns the data saved in the database.
     * @param {DatasetVersionCreateManyAndReturnArgs} args - Arguments to create many DatasetVersions.
     * @example
     * // Create many DatasetVersions
     * const datasetVersion = await prisma.datasetVersion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DatasetVersions and only return the `id`
     * const datasetVersionWithIdOnly = await prisma.datasetVersion.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DatasetVersionCreateManyAndReturnArgs>(args?: SelectSubset<T, DatasetVersionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DatasetVersion.
     * @param {DatasetVersionDeleteArgs} args - Arguments to delete one DatasetVersion.
     * @example
     * // Delete one DatasetVersion
     * const DatasetVersion = await prisma.datasetVersion.delete({
     *   where: {
     *     // ... filter to delete one DatasetVersion
     *   }
     * })
     * 
     */
    delete<T extends DatasetVersionDeleteArgs>(args: SelectSubset<T, DatasetVersionDeleteArgs<ExtArgs>>): Prisma__DatasetVersionClient<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DatasetVersion.
     * @param {DatasetVersionUpdateArgs} args - Arguments to update one DatasetVersion.
     * @example
     * // Update one DatasetVersion
     * const datasetVersion = await prisma.datasetVersion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DatasetVersionUpdateArgs>(args: SelectSubset<T, DatasetVersionUpdateArgs<ExtArgs>>): Prisma__DatasetVersionClient<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DatasetVersions.
     * @param {DatasetVersionDeleteManyArgs} args - Arguments to filter DatasetVersions to delete.
     * @example
     * // Delete a few DatasetVersions
     * const { count } = await prisma.datasetVersion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DatasetVersionDeleteManyArgs>(args?: SelectSubset<T, DatasetVersionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatasetVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetVersionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DatasetVersions
     * const datasetVersion = await prisma.datasetVersion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DatasetVersionUpdateManyArgs>(args: SelectSubset<T, DatasetVersionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatasetVersions and returns the data updated in the database.
     * @param {DatasetVersionUpdateManyAndReturnArgs} args - Arguments to update many DatasetVersions.
     * @example
     * // Update many DatasetVersions
     * const datasetVersion = await prisma.datasetVersion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DatasetVersions and only return the `id`
     * const datasetVersionWithIdOnly = await prisma.datasetVersion.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DatasetVersionUpdateManyAndReturnArgs>(args: SelectSubset<T, DatasetVersionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DatasetVersion.
     * @param {DatasetVersionUpsertArgs} args - Arguments to update or create a DatasetVersion.
     * @example
     * // Update or create a DatasetVersion
     * const datasetVersion = await prisma.datasetVersion.upsert({
     *   create: {
     *     // ... data to create a DatasetVersion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DatasetVersion we want to update
     *   }
     * })
     */
    upsert<T extends DatasetVersionUpsertArgs>(args: SelectSubset<T, DatasetVersionUpsertArgs<ExtArgs>>): Prisma__DatasetVersionClient<$Result.GetResult<Prisma.$DatasetVersionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DatasetVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetVersionCountArgs} args - Arguments to filter DatasetVersions to count.
     * @example
     * // Count the number of DatasetVersions
     * const count = await prisma.datasetVersion.count({
     *   where: {
     *     // ... the filter for the DatasetVersions we want to count
     *   }
     * })
    **/
    count<T extends DatasetVersionCountArgs>(
      args?: Subset<T, DatasetVersionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DatasetVersionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DatasetVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetVersionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DatasetVersionAggregateArgs>(args: Subset<T, DatasetVersionAggregateArgs>): Prisma.PrismaPromise<GetDatasetVersionAggregateType<T>>

    /**
     * Group by DatasetVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetVersionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DatasetVersionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DatasetVersionGroupByArgs['orderBy'] }
        : { orderBy?: DatasetVersionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DatasetVersionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDatasetVersionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DatasetVersion model
   */
  readonly fields: DatasetVersionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DatasetVersion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DatasetVersionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DatasetVersion model
   */
  interface DatasetVersionFieldRefs {
    readonly id: FieldRef<"DatasetVersion", 'String'>
    readonly productId: FieldRef<"DatasetVersion", 'String'>
    readonly displayName: FieldRef<"DatasetVersion", 'String'>
    readonly versionName: FieldRef<"DatasetVersion", 'String'>
    readonly moduleName: FieldRef<"DatasetVersion", 'String'>
    readonly savePath: FieldRef<"DatasetVersion", 'String'>
    readonly imageCount: FieldRef<"DatasetVersion", 'Int'>
    readonly config: FieldRef<"DatasetVersion", 'String'>
    readonly createdAt: FieldRef<"DatasetVersion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DatasetVersion findUnique
   */
  export type DatasetVersionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * Filter, which DatasetVersion to fetch.
     */
    where: DatasetVersionWhereUniqueInput
  }

  /**
   * DatasetVersion findUniqueOrThrow
   */
  export type DatasetVersionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * Filter, which DatasetVersion to fetch.
     */
    where: DatasetVersionWhereUniqueInput
  }

  /**
   * DatasetVersion findFirst
   */
  export type DatasetVersionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * Filter, which DatasetVersion to fetch.
     */
    where?: DatasetVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatasetVersions to fetch.
     */
    orderBy?: DatasetVersionOrderByWithRelationInput | DatasetVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatasetVersions.
     */
    cursor?: DatasetVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatasetVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatasetVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatasetVersions.
     */
    distinct?: DatasetVersionScalarFieldEnum | DatasetVersionScalarFieldEnum[]
  }

  /**
   * DatasetVersion findFirstOrThrow
   */
  export type DatasetVersionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * Filter, which DatasetVersion to fetch.
     */
    where?: DatasetVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatasetVersions to fetch.
     */
    orderBy?: DatasetVersionOrderByWithRelationInput | DatasetVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatasetVersions.
     */
    cursor?: DatasetVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatasetVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatasetVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatasetVersions.
     */
    distinct?: DatasetVersionScalarFieldEnum | DatasetVersionScalarFieldEnum[]
  }

  /**
   * DatasetVersion findMany
   */
  export type DatasetVersionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * Filter, which DatasetVersions to fetch.
     */
    where?: DatasetVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatasetVersions to fetch.
     */
    orderBy?: DatasetVersionOrderByWithRelationInput | DatasetVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DatasetVersions.
     */
    cursor?: DatasetVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatasetVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatasetVersions.
     */
    skip?: number
    distinct?: DatasetVersionScalarFieldEnum | DatasetVersionScalarFieldEnum[]
  }

  /**
   * DatasetVersion create
   */
  export type DatasetVersionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * The data needed to create a DatasetVersion.
     */
    data: XOR<DatasetVersionCreateInput, DatasetVersionUncheckedCreateInput>
  }

  /**
   * DatasetVersion createMany
   */
  export type DatasetVersionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DatasetVersions.
     */
    data: DatasetVersionCreateManyInput | DatasetVersionCreateManyInput[]
  }

  /**
   * DatasetVersion createManyAndReturn
   */
  export type DatasetVersionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * The data used to create many DatasetVersions.
     */
    data: DatasetVersionCreateManyInput | DatasetVersionCreateManyInput[]
  }

  /**
   * DatasetVersion update
   */
  export type DatasetVersionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * The data needed to update a DatasetVersion.
     */
    data: XOR<DatasetVersionUpdateInput, DatasetVersionUncheckedUpdateInput>
    /**
     * Choose, which DatasetVersion to update.
     */
    where: DatasetVersionWhereUniqueInput
  }

  /**
   * DatasetVersion updateMany
   */
  export type DatasetVersionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DatasetVersions.
     */
    data: XOR<DatasetVersionUpdateManyMutationInput, DatasetVersionUncheckedUpdateManyInput>
    /**
     * Filter which DatasetVersions to update
     */
    where?: DatasetVersionWhereInput
    /**
     * Limit how many DatasetVersions to update.
     */
    limit?: number
  }

  /**
   * DatasetVersion updateManyAndReturn
   */
  export type DatasetVersionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * The data used to update DatasetVersions.
     */
    data: XOR<DatasetVersionUpdateManyMutationInput, DatasetVersionUncheckedUpdateManyInput>
    /**
     * Filter which DatasetVersions to update
     */
    where?: DatasetVersionWhereInput
    /**
     * Limit how many DatasetVersions to update.
     */
    limit?: number
  }

  /**
   * DatasetVersion upsert
   */
  export type DatasetVersionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * The filter to search for the DatasetVersion to update in case it exists.
     */
    where: DatasetVersionWhereUniqueInput
    /**
     * In case the DatasetVersion found by the `where` argument doesn't exist, create a new DatasetVersion with this data.
     */
    create: XOR<DatasetVersionCreateInput, DatasetVersionUncheckedCreateInput>
    /**
     * In case the DatasetVersion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DatasetVersionUpdateInput, DatasetVersionUncheckedUpdateInput>
  }

  /**
   * DatasetVersion delete
   */
  export type DatasetVersionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
    /**
     * Filter which DatasetVersion to delete.
     */
    where: DatasetVersionWhereUniqueInput
  }

  /**
   * DatasetVersion deleteMany
   */
  export type DatasetVersionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatasetVersions to delete
     */
    where?: DatasetVersionWhereInput
    /**
     * Limit how many DatasetVersions to delete.
     */
    limit?: number
  }

  /**
   * DatasetVersion without action
   */
  export type DatasetVersionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetVersion
     */
    select?: DatasetVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetVersion
     */
    omit?: DatasetVersionOmit<ExtArgs> | null
  }


  /**
   * Model Camera
   */

  export type AggregateCamera = {
    _count: CameraCountAggregateOutputType | null
    _min: CameraMinAggregateOutputType | null
    _max: CameraMaxAggregateOutputType | null
  }

  export type CameraMinAggregateOutputType = {
    id: string | null
    name: string | null
    ip: string | null
    status: string | null
    config: string | null
    isEnabled: boolean | null
    isNetworkCamera: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CameraMaxAggregateOutputType = {
    id: string | null
    name: string | null
    ip: string | null
    status: string | null
    config: string | null
    isEnabled: boolean | null
    isNetworkCamera: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CameraCountAggregateOutputType = {
    id: number
    name: number
    ip: number
    status: number
    config: number
    isEnabled: number
    isNetworkCamera: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CameraMinAggregateInputType = {
    id?: true
    name?: true
    ip?: true
    status?: true
    config?: true
    isEnabled?: true
    isNetworkCamera?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CameraMaxAggregateInputType = {
    id?: true
    name?: true
    ip?: true
    status?: true
    config?: true
    isEnabled?: true
    isNetworkCamera?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CameraCountAggregateInputType = {
    id?: true
    name?: true
    ip?: true
    status?: true
    config?: true
    isEnabled?: true
    isNetworkCamera?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CameraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Camera to aggregate.
     */
    where?: CameraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cameras to fetch.
     */
    orderBy?: CameraOrderByWithRelationInput | CameraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CameraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cameras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cameras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cameras
    **/
    _count?: true | CameraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CameraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CameraMaxAggregateInputType
  }

  export type GetCameraAggregateType<T extends CameraAggregateArgs> = {
        [P in keyof T & keyof AggregateCamera]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCamera[P]>
      : GetScalarType<T[P], AggregateCamera[P]>
  }




  export type CameraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CameraWhereInput
    orderBy?: CameraOrderByWithAggregationInput | CameraOrderByWithAggregationInput[]
    by: CameraScalarFieldEnum[] | CameraScalarFieldEnum
    having?: CameraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CameraCountAggregateInputType | true
    _min?: CameraMinAggregateInputType
    _max?: CameraMaxAggregateInputType
  }

  export type CameraGroupByOutputType = {
    id: string
    name: string
    ip: string
    status: string
    config: string | null
    isEnabled: boolean
    isNetworkCamera: boolean
    createdAt: Date
    updatedAt: Date
    _count: CameraCountAggregateOutputType | null
    _min: CameraMinAggregateOutputType | null
    _max: CameraMaxAggregateOutputType | null
  }

  type GetCameraGroupByPayload<T extends CameraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CameraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CameraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CameraGroupByOutputType[P]>
            : GetScalarType<T[P], CameraGroupByOutputType[P]>
        }
      >
    >


  export type CameraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    ip?: boolean
    status?: boolean
    config?: boolean
    isEnabled?: boolean
    isNetworkCamera?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["camera"]>

  export type CameraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    ip?: boolean
    status?: boolean
    config?: boolean
    isEnabled?: boolean
    isNetworkCamera?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["camera"]>

  export type CameraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    ip?: boolean
    status?: boolean
    config?: boolean
    isEnabled?: boolean
    isNetworkCamera?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["camera"]>

  export type CameraSelectScalar = {
    id?: boolean
    name?: boolean
    ip?: boolean
    status?: boolean
    config?: boolean
    isEnabled?: boolean
    isNetworkCamera?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CameraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "ip" | "status" | "config" | "isEnabled" | "isNetworkCamera" | "createdAt" | "updatedAt", ExtArgs["result"]["camera"]>

  export type $CameraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Camera"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      ip: string
      status: string
      config: string | null
      isEnabled: boolean
      isNetworkCamera: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["camera"]>
    composites: {}
  }

  type CameraGetPayload<S extends boolean | null | undefined | CameraDefaultArgs> = $Result.GetResult<Prisma.$CameraPayload, S>

  type CameraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CameraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CameraCountAggregateInputType | true
    }

  export interface CameraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Camera'], meta: { name: 'Camera' } }
    /**
     * Find zero or one Camera that matches the filter.
     * @param {CameraFindUniqueArgs} args - Arguments to find a Camera
     * @example
     * // Get one Camera
     * const camera = await prisma.camera.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CameraFindUniqueArgs>(args: SelectSubset<T, CameraFindUniqueArgs<ExtArgs>>): Prisma__CameraClient<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Camera that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CameraFindUniqueOrThrowArgs} args - Arguments to find a Camera
     * @example
     * // Get one Camera
     * const camera = await prisma.camera.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CameraFindUniqueOrThrowArgs>(args: SelectSubset<T, CameraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CameraClient<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Camera that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CameraFindFirstArgs} args - Arguments to find a Camera
     * @example
     * // Get one Camera
     * const camera = await prisma.camera.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CameraFindFirstArgs>(args?: SelectSubset<T, CameraFindFirstArgs<ExtArgs>>): Prisma__CameraClient<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Camera that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CameraFindFirstOrThrowArgs} args - Arguments to find a Camera
     * @example
     * // Get one Camera
     * const camera = await prisma.camera.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CameraFindFirstOrThrowArgs>(args?: SelectSubset<T, CameraFindFirstOrThrowArgs<ExtArgs>>): Prisma__CameraClient<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cameras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CameraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cameras
     * const cameras = await prisma.camera.findMany()
     * 
     * // Get first 10 Cameras
     * const cameras = await prisma.camera.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cameraWithIdOnly = await prisma.camera.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CameraFindManyArgs>(args?: SelectSubset<T, CameraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Camera.
     * @param {CameraCreateArgs} args - Arguments to create a Camera.
     * @example
     * // Create one Camera
     * const Camera = await prisma.camera.create({
     *   data: {
     *     // ... data to create a Camera
     *   }
     * })
     * 
     */
    create<T extends CameraCreateArgs>(args: SelectSubset<T, CameraCreateArgs<ExtArgs>>): Prisma__CameraClient<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cameras.
     * @param {CameraCreateManyArgs} args - Arguments to create many Cameras.
     * @example
     * // Create many Cameras
     * const camera = await prisma.camera.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CameraCreateManyArgs>(args?: SelectSubset<T, CameraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cameras and returns the data saved in the database.
     * @param {CameraCreateManyAndReturnArgs} args - Arguments to create many Cameras.
     * @example
     * // Create many Cameras
     * const camera = await prisma.camera.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cameras and only return the `id`
     * const cameraWithIdOnly = await prisma.camera.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CameraCreateManyAndReturnArgs>(args?: SelectSubset<T, CameraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Camera.
     * @param {CameraDeleteArgs} args - Arguments to delete one Camera.
     * @example
     * // Delete one Camera
     * const Camera = await prisma.camera.delete({
     *   where: {
     *     // ... filter to delete one Camera
     *   }
     * })
     * 
     */
    delete<T extends CameraDeleteArgs>(args: SelectSubset<T, CameraDeleteArgs<ExtArgs>>): Prisma__CameraClient<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Camera.
     * @param {CameraUpdateArgs} args - Arguments to update one Camera.
     * @example
     * // Update one Camera
     * const camera = await prisma.camera.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CameraUpdateArgs>(args: SelectSubset<T, CameraUpdateArgs<ExtArgs>>): Prisma__CameraClient<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cameras.
     * @param {CameraDeleteManyArgs} args - Arguments to filter Cameras to delete.
     * @example
     * // Delete a few Cameras
     * const { count } = await prisma.camera.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CameraDeleteManyArgs>(args?: SelectSubset<T, CameraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cameras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CameraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cameras
     * const camera = await prisma.camera.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CameraUpdateManyArgs>(args: SelectSubset<T, CameraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cameras and returns the data updated in the database.
     * @param {CameraUpdateManyAndReturnArgs} args - Arguments to update many Cameras.
     * @example
     * // Update many Cameras
     * const camera = await prisma.camera.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cameras and only return the `id`
     * const cameraWithIdOnly = await prisma.camera.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CameraUpdateManyAndReturnArgs>(args: SelectSubset<T, CameraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Camera.
     * @param {CameraUpsertArgs} args - Arguments to update or create a Camera.
     * @example
     * // Update or create a Camera
     * const camera = await prisma.camera.upsert({
     *   create: {
     *     // ... data to create a Camera
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Camera we want to update
     *   }
     * })
     */
    upsert<T extends CameraUpsertArgs>(args: SelectSubset<T, CameraUpsertArgs<ExtArgs>>): Prisma__CameraClient<$Result.GetResult<Prisma.$CameraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cameras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CameraCountArgs} args - Arguments to filter Cameras to count.
     * @example
     * // Count the number of Cameras
     * const count = await prisma.camera.count({
     *   where: {
     *     // ... the filter for the Cameras we want to count
     *   }
     * })
    **/
    count<T extends CameraCountArgs>(
      args?: Subset<T, CameraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CameraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Camera.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CameraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CameraAggregateArgs>(args: Subset<T, CameraAggregateArgs>): Prisma.PrismaPromise<GetCameraAggregateType<T>>

    /**
     * Group by Camera.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CameraGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CameraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CameraGroupByArgs['orderBy'] }
        : { orderBy?: CameraGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CameraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCameraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Camera model
   */
  readonly fields: CameraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Camera.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CameraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Camera model
   */
  interface CameraFieldRefs {
    readonly id: FieldRef<"Camera", 'String'>
    readonly name: FieldRef<"Camera", 'String'>
    readonly ip: FieldRef<"Camera", 'String'>
    readonly status: FieldRef<"Camera", 'String'>
    readonly config: FieldRef<"Camera", 'String'>
    readonly isEnabled: FieldRef<"Camera", 'Boolean'>
    readonly isNetworkCamera: FieldRef<"Camera", 'Boolean'>
    readonly createdAt: FieldRef<"Camera", 'DateTime'>
    readonly updatedAt: FieldRef<"Camera", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Camera findUnique
   */
  export type CameraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * Filter, which Camera to fetch.
     */
    where: CameraWhereUniqueInput
  }

  /**
   * Camera findUniqueOrThrow
   */
  export type CameraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * Filter, which Camera to fetch.
     */
    where: CameraWhereUniqueInput
  }

  /**
   * Camera findFirst
   */
  export type CameraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * Filter, which Camera to fetch.
     */
    where?: CameraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cameras to fetch.
     */
    orderBy?: CameraOrderByWithRelationInput | CameraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cameras.
     */
    cursor?: CameraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cameras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cameras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cameras.
     */
    distinct?: CameraScalarFieldEnum | CameraScalarFieldEnum[]
  }

  /**
   * Camera findFirstOrThrow
   */
  export type CameraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * Filter, which Camera to fetch.
     */
    where?: CameraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cameras to fetch.
     */
    orderBy?: CameraOrderByWithRelationInput | CameraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cameras.
     */
    cursor?: CameraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cameras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cameras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cameras.
     */
    distinct?: CameraScalarFieldEnum | CameraScalarFieldEnum[]
  }

  /**
   * Camera findMany
   */
  export type CameraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * Filter, which Cameras to fetch.
     */
    where?: CameraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cameras to fetch.
     */
    orderBy?: CameraOrderByWithRelationInput | CameraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cameras.
     */
    cursor?: CameraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cameras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cameras.
     */
    skip?: number
    distinct?: CameraScalarFieldEnum | CameraScalarFieldEnum[]
  }

  /**
   * Camera create
   */
  export type CameraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * The data needed to create a Camera.
     */
    data: XOR<CameraCreateInput, CameraUncheckedCreateInput>
  }

  /**
   * Camera createMany
   */
  export type CameraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cameras.
     */
    data: CameraCreateManyInput | CameraCreateManyInput[]
  }

  /**
   * Camera createManyAndReturn
   */
  export type CameraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * The data used to create many Cameras.
     */
    data: CameraCreateManyInput | CameraCreateManyInput[]
  }

  /**
   * Camera update
   */
  export type CameraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * The data needed to update a Camera.
     */
    data: XOR<CameraUpdateInput, CameraUncheckedUpdateInput>
    /**
     * Choose, which Camera to update.
     */
    where: CameraWhereUniqueInput
  }

  /**
   * Camera updateMany
   */
  export type CameraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cameras.
     */
    data: XOR<CameraUpdateManyMutationInput, CameraUncheckedUpdateManyInput>
    /**
     * Filter which Cameras to update
     */
    where?: CameraWhereInput
    /**
     * Limit how many Cameras to update.
     */
    limit?: number
  }

  /**
   * Camera updateManyAndReturn
   */
  export type CameraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * The data used to update Cameras.
     */
    data: XOR<CameraUpdateManyMutationInput, CameraUncheckedUpdateManyInput>
    /**
     * Filter which Cameras to update
     */
    where?: CameraWhereInput
    /**
     * Limit how many Cameras to update.
     */
    limit?: number
  }

  /**
   * Camera upsert
   */
  export type CameraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * The filter to search for the Camera to update in case it exists.
     */
    where: CameraWhereUniqueInput
    /**
     * In case the Camera found by the `where` argument doesn't exist, create a new Camera with this data.
     */
    create: XOR<CameraCreateInput, CameraUncheckedCreateInput>
    /**
     * In case the Camera was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CameraUpdateInput, CameraUncheckedUpdateInput>
  }

  /**
   * Camera delete
   */
  export type CameraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
    /**
     * Filter which Camera to delete.
     */
    where: CameraWhereUniqueInput
  }

  /**
   * Camera deleteMany
   */
  export type CameraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cameras to delete
     */
    where?: CameraWhereInput
    /**
     * Limit how many Cameras to delete.
     */
    limit?: number
  }

  /**
   * Camera without action
   */
  export type CameraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Camera
     */
    select?: CameraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Camera
     */
    omit?: CameraOmit<ExtArgs> | null
  }


  /**
   * Model TrainingRecord
   */

  export type AggregateTrainingRecord = {
    _count: TrainingRecordCountAggregateOutputType | null
    _avg: TrainingRecordAvgAggregateOutputType | null
    _sum: TrainingRecordSumAggregateOutputType | null
    _min: TrainingRecordMinAggregateOutputType | null
    _max: TrainingRecordMaxAggregateOutputType | null
  }

  export type TrainingRecordAvgAggregateOutputType = {
    progress: number | null
    totalEpochs: number | null
    currentEpoch: number | null
    batchSize: number | null
    learningRate: number | null
    latestIter: number | null
    generation: number | null
    fpCount: number | null
    fnCount: number | null
    yoloFpCount: number | null
    decoderDepth: number | null
    epochs: number | null
  }

  export type TrainingRecordSumAggregateOutputType = {
    progress: number | null
    totalEpochs: number | null
    currentEpoch: number | null
    batchSize: number | null
    learningRate: number | null
    latestIter: number | null
    generation: number | null
    fpCount: number | null
    fnCount: number | null
    yoloFpCount: number | null
    decoderDepth: number | null
    epochs: number | null
  }

  export type TrainingRecordMinAggregateOutputType = {
    id: string | null
    productId: string | null
    taskUuid: string | null
    labelName: string | null
    modelName: string | null
    config: string | null
    status: string | null
    progress: number | null
    totalEpochs: number | null
    currentEpoch: number | null
    batchSize: number | null
    learningRate: number | null
    latestIter: number | null
    metrics: string | null
    logs: string | null
    startTime: Date | null
    endTime: Date | null
    hasBestModel: boolean | null
    outputPath: string | null
    createdAt: Date | null
    updatedAt: Date | null
    isRetrain: boolean | null
    baseTaskUuid: string | null
    pathId: string | null
    taskChain: string | null
    generation: number | null
    fpCount: number | null
    fnCount: number | null
    yoloFpCount: number | null
    encoderName: string | null
    decoderDepth: number | null
    epochs: number | null
    freezeEncoder: boolean | null
  }

  export type TrainingRecordMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    taskUuid: string | null
    labelName: string | null
    modelName: string | null
    config: string | null
    status: string | null
    progress: number | null
    totalEpochs: number | null
    currentEpoch: number | null
    batchSize: number | null
    learningRate: number | null
    latestIter: number | null
    metrics: string | null
    logs: string | null
    startTime: Date | null
    endTime: Date | null
    hasBestModel: boolean | null
    outputPath: string | null
    createdAt: Date | null
    updatedAt: Date | null
    isRetrain: boolean | null
    baseTaskUuid: string | null
    pathId: string | null
    taskChain: string | null
    generation: number | null
    fpCount: number | null
    fnCount: number | null
    yoloFpCount: number | null
    encoderName: string | null
    decoderDepth: number | null
    epochs: number | null
    freezeEncoder: boolean | null
  }

  export type TrainingRecordCountAggregateOutputType = {
    id: number
    productId: number
    taskUuid: number
    labelName: number
    modelName: number
    config: number
    status: number
    progress: number
    totalEpochs: number
    currentEpoch: number
    batchSize: number
    learningRate: number
    latestIter: number
    metrics: number
    logs: number
    startTime: number
    endTime: number
    hasBestModel: number
    outputPath: number
    createdAt: number
    updatedAt: number
    isRetrain: number
    baseTaskUuid: number
    pathId: number
    taskChain: number
    generation: number
    fpCount: number
    fnCount: number
    yoloFpCount: number
    encoderName: number
    decoderDepth: number
    epochs: number
    freezeEncoder: number
    _all: number
  }


  export type TrainingRecordAvgAggregateInputType = {
    progress?: true
    totalEpochs?: true
    currentEpoch?: true
    batchSize?: true
    learningRate?: true
    latestIter?: true
    generation?: true
    fpCount?: true
    fnCount?: true
    yoloFpCount?: true
    decoderDepth?: true
    epochs?: true
  }

  export type TrainingRecordSumAggregateInputType = {
    progress?: true
    totalEpochs?: true
    currentEpoch?: true
    batchSize?: true
    learningRate?: true
    latestIter?: true
    generation?: true
    fpCount?: true
    fnCount?: true
    yoloFpCount?: true
    decoderDepth?: true
    epochs?: true
  }

  export type TrainingRecordMinAggregateInputType = {
    id?: true
    productId?: true
    taskUuid?: true
    labelName?: true
    modelName?: true
    config?: true
    status?: true
    progress?: true
    totalEpochs?: true
    currentEpoch?: true
    batchSize?: true
    learningRate?: true
    latestIter?: true
    metrics?: true
    logs?: true
    startTime?: true
    endTime?: true
    hasBestModel?: true
    outputPath?: true
    createdAt?: true
    updatedAt?: true
    isRetrain?: true
    baseTaskUuid?: true
    pathId?: true
    taskChain?: true
    generation?: true
    fpCount?: true
    fnCount?: true
    yoloFpCount?: true
    encoderName?: true
    decoderDepth?: true
    epochs?: true
    freezeEncoder?: true
  }

  export type TrainingRecordMaxAggregateInputType = {
    id?: true
    productId?: true
    taskUuid?: true
    labelName?: true
    modelName?: true
    config?: true
    status?: true
    progress?: true
    totalEpochs?: true
    currentEpoch?: true
    batchSize?: true
    learningRate?: true
    latestIter?: true
    metrics?: true
    logs?: true
    startTime?: true
    endTime?: true
    hasBestModel?: true
    outputPath?: true
    createdAt?: true
    updatedAt?: true
    isRetrain?: true
    baseTaskUuid?: true
    pathId?: true
    taskChain?: true
    generation?: true
    fpCount?: true
    fnCount?: true
    yoloFpCount?: true
    encoderName?: true
    decoderDepth?: true
    epochs?: true
    freezeEncoder?: true
  }

  export type TrainingRecordCountAggregateInputType = {
    id?: true
    productId?: true
    taskUuid?: true
    labelName?: true
    modelName?: true
    config?: true
    status?: true
    progress?: true
    totalEpochs?: true
    currentEpoch?: true
    batchSize?: true
    learningRate?: true
    latestIter?: true
    metrics?: true
    logs?: true
    startTime?: true
    endTime?: true
    hasBestModel?: true
    outputPath?: true
    createdAt?: true
    updatedAt?: true
    isRetrain?: true
    baseTaskUuid?: true
    pathId?: true
    taskChain?: true
    generation?: true
    fpCount?: true
    fnCount?: true
    yoloFpCount?: true
    encoderName?: true
    decoderDepth?: true
    epochs?: true
    freezeEncoder?: true
    _all?: true
  }

  export type TrainingRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingRecord to aggregate.
     */
    where?: TrainingRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingRecords to fetch.
     */
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrainingRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrainingRecords
    **/
    _count?: true | TrainingRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrainingRecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrainingRecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrainingRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrainingRecordMaxAggregateInputType
  }

  export type GetTrainingRecordAggregateType<T extends TrainingRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainingRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainingRecord[P]>
      : GetScalarType<T[P], AggregateTrainingRecord[P]>
  }




  export type TrainingRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingRecordWhereInput
    orderBy?: TrainingRecordOrderByWithAggregationInput | TrainingRecordOrderByWithAggregationInput[]
    by: TrainingRecordScalarFieldEnum[] | TrainingRecordScalarFieldEnum
    having?: TrainingRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrainingRecordCountAggregateInputType | true
    _avg?: TrainingRecordAvgAggregateInputType
    _sum?: TrainingRecordSumAggregateInputType
    _min?: TrainingRecordMinAggregateInputType
    _max?: TrainingRecordMaxAggregateInputType
  }

  export type TrainingRecordGroupByOutputType = {
    id: string
    productId: string
    taskUuid: string
    labelName: string
    modelName: string
    config: string
    status: string
    progress: number
    totalEpochs: number | null
    currentEpoch: number | null
    batchSize: number | null
    learningRate: number | null
    latestIter: number | null
    metrics: string
    logs: string
    startTime: Date | null
    endTime: Date | null
    hasBestModel: boolean
    outputPath: string | null
    createdAt: Date
    updatedAt: Date
    isRetrain: boolean
    baseTaskUuid: string | null
    pathId: string | null
    taskChain: string
    generation: number
    fpCount: number
    fnCount: number
    yoloFpCount: number
    encoderName: string | null
    decoderDepth: number | null
    epochs: number | null
    freezeEncoder: boolean | null
    _count: TrainingRecordCountAggregateOutputType | null
    _avg: TrainingRecordAvgAggregateOutputType | null
    _sum: TrainingRecordSumAggregateOutputType | null
    _min: TrainingRecordMinAggregateOutputType | null
    _max: TrainingRecordMaxAggregateOutputType | null
  }

  type GetTrainingRecordGroupByPayload<T extends TrainingRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrainingRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrainingRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrainingRecordGroupByOutputType[P]>
            : GetScalarType<T[P], TrainingRecordGroupByOutputType[P]>
        }
      >
    >


  export type TrainingRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    taskUuid?: boolean
    labelName?: boolean
    modelName?: boolean
    config?: boolean
    status?: boolean
    progress?: boolean
    totalEpochs?: boolean
    currentEpoch?: boolean
    batchSize?: boolean
    learningRate?: boolean
    latestIter?: boolean
    metrics?: boolean
    logs?: boolean
    startTime?: boolean
    endTime?: boolean
    hasBestModel?: boolean
    outputPath?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isRetrain?: boolean
    baseTaskUuid?: boolean
    pathId?: boolean
    taskChain?: boolean
    generation?: boolean
    fpCount?: boolean
    fnCount?: boolean
    yoloFpCount?: boolean
    encoderName?: boolean
    decoderDepth?: boolean
    epochs?: boolean
    freezeEncoder?: boolean
  }, ExtArgs["result"]["trainingRecord"]>

  export type TrainingRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    taskUuid?: boolean
    labelName?: boolean
    modelName?: boolean
    config?: boolean
    status?: boolean
    progress?: boolean
    totalEpochs?: boolean
    currentEpoch?: boolean
    batchSize?: boolean
    learningRate?: boolean
    latestIter?: boolean
    metrics?: boolean
    logs?: boolean
    startTime?: boolean
    endTime?: boolean
    hasBestModel?: boolean
    outputPath?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isRetrain?: boolean
    baseTaskUuid?: boolean
    pathId?: boolean
    taskChain?: boolean
    generation?: boolean
    fpCount?: boolean
    fnCount?: boolean
    yoloFpCount?: boolean
    encoderName?: boolean
    decoderDepth?: boolean
    epochs?: boolean
    freezeEncoder?: boolean
  }, ExtArgs["result"]["trainingRecord"]>

  export type TrainingRecordSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    taskUuid?: boolean
    labelName?: boolean
    modelName?: boolean
    config?: boolean
    status?: boolean
    progress?: boolean
    totalEpochs?: boolean
    currentEpoch?: boolean
    batchSize?: boolean
    learningRate?: boolean
    latestIter?: boolean
    metrics?: boolean
    logs?: boolean
    startTime?: boolean
    endTime?: boolean
    hasBestModel?: boolean
    outputPath?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isRetrain?: boolean
    baseTaskUuid?: boolean
    pathId?: boolean
    taskChain?: boolean
    generation?: boolean
    fpCount?: boolean
    fnCount?: boolean
    yoloFpCount?: boolean
    encoderName?: boolean
    decoderDepth?: boolean
    epochs?: boolean
    freezeEncoder?: boolean
  }, ExtArgs["result"]["trainingRecord"]>

  export type TrainingRecordSelectScalar = {
    id?: boolean
    productId?: boolean
    taskUuid?: boolean
    labelName?: boolean
    modelName?: boolean
    config?: boolean
    status?: boolean
    progress?: boolean
    totalEpochs?: boolean
    currentEpoch?: boolean
    batchSize?: boolean
    learningRate?: boolean
    latestIter?: boolean
    metrics?: boolean
    logs?: boolean
    startTime?: boolean
    endTime?: boolean
    hasBestModel?: boolean
    outputPath?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isRetrain?: boolean
    baseTaskUuid?: boolean
    pathId?: boolean
    taskChain?: boolean
    generation?: boolean
    fpCount?: boolean
    fnCount?: boolean
    yoloFpCount?: boolean
    encoderName?: boolean
    decoderDepth?: boolean
    epochs?: boolean
    freezeEncoder?: boolean
  }

  export type TrainingRecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "productId" | "taskUuid" | "labelName" | "modelName" | "config" | "status" | "progress" | "totalEpochs" | "currentEpoch" | "batchSize" | "learningRate" | "latestIter" | "metrics" | "logs" | "startTime" | "endTime" | "hasBestModel" | "outputPath" | "createdAt" | "updatedAt" | "isRetrain" | "baseTaskUuid" | "pathId" | "taskChain" | "generation" | "fpCount" | "fnCount" | "yoloFpCount" | "encoderName" | "decoderDepth" | "epochs" | "freezeEncoder", ExtArgs["result"]["trainingRecord"]>

  export type $TrainingRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrainingRecord"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      taskUuid: string
      labelName: string
      modelName: string
      config: string
      status: string
      progress: number
      totalEpochs: number | null
      currentEpoch: number | null
      batchSize: number | null
      learningRate: number | null
      latestIter: number | null
      metrics: string
      logs: string
      startTime: Date | null
      endTime: Date | null
      hasBestModel: boolean
      outputPath: string | null
      createdAt: Date
      updatedAt: Date
      isRetrain: boolean
      baseTaskUuid: string | null
      pathId: string | null
      taskChain: string
      generation: number
      fpCount: number
      fnCount: number
      yoloFpCount: number
      encoderName: string | null
      decoderDepth: number | null
      epochs: number | null
      freezeEncoder: boolean | null
    }, ExtArgs["result"]["trainingRecord"]>
    composites: {}
  }

  type TrainingRecordGetPayload<S extends boolean | null | undefined | TrainingRecordDefaultArgs> = $Result.GetResult<Prisma.$TrainingRecordPayload, S>

  type TrainingRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TrainingRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TrainingRecordCountAggregateInputType | true
    }

  export interface TrainingRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrainingRecord'], meta: { name: 'TrainingRecord' } }
    /**
     * Find zero or one TrainingRecord that matches the filter.
     * @param {TrainingRecordFindUniqueArgs} args - Arguments to find a TrainingRecord
     * @example
     * // Get one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrainingRecordFindUniqueArgs>(args: SelectSubset<T, TrainingRecordFindUniqueArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TrainingRecord that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TrainingRecordFindUniqueOrThrowArgs} args - Arguments to find a TrainingRecord
     * @example
     * // Get one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrainingRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, TrainingRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TrainingRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordFindFirstArgs} args - Arguments to find a TrainingRecord
     * @example
     * // Get one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrainingRecordFindFirstArgs>(args?: SelectSubset<T, TrainingRecordFindFirstArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TrainingRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordFindFirstOrThrowArgs} args - Arguments to find a TrainingRecord
     * @example
     * // Get one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrainingRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, TrainingRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TrainingRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrainingRecords
     * const trainingRecords = await prisma.trainingRecord.findMany()
     * 
     * // Get first 10 TrainingRecords
     * const trainingRecords = await prisma.trainingRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trainingRecordWithIdOnly = await prisma.trainingRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrainingRecordFindManyArgs>(args?: SelectSubset<T, TrainingRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TrainingRecord.
     * @param {TrainingRecordCreateArgs} args - Arguments to create a TrainingRecord.
     * @example
     * // Create one TrainingRecord
     * const TrainingRecord = await prisma.trainingRecord.create({
     *   data: {
     *     // ... data to create a TrainingRecord
     *   }
     * })
     * 
     */
    create<T extends TrainingRecordCreateArgs>(args: SelectSubset<T, TrainingRecordCreateArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TrainingRecords.
     * @param {TrainingRecordCreateManyArgs} args - Arguments to create many TrainingRecords.
     * @example
     * // Create many TrainingRecords
     * const trainingRecord = await prisma.trainingRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrainingRecordCreateManyArgs>(args?: SelectSubset<T, TrainingRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrainingRecords and returns the data saved in the database.
     * @param {TrainingRecordCreateManyAndReturnArgs} args - Arguments to create many TrainingRecords.
     * @example
     * // Create many TrainingRecords
     * const trainingRecord = await prisma.trainingRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrainingRecords and only return the `id`
     * const trainingRecordWithIdOnly = await prisma.trainingRecord.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrainingRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, TrainingRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TrainingRecord.
     * @param {TrainingRecordDeleteArgs} args - Arguments to delete one TrainingRecord.
     * @example
     * // Delete one TrainingRecord
     * const TrainingRecord = await prisma.trainingRecord.delete({
     *   where: {
     *     // ... filter to delete one TrainingRecord
     *   }
     * })
     * 
     */
    delete<T extends TrainingRecordDeleteArgs>(args: SelectSubset<T, TrainingRecordDeleteArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TrainingRecord.
     * @param {TrainingRecordUpdateArgs} args - Arguments to update one TrainingRecord.
     * @example
     * // Update one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrainingRecordUpdateArgs>(args: SelectSubset<T, TrainingRecordUpdateArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TrainingRecords.
     * @param {TrainingRecordDeleteManyArgs} args - Arguments to filter TrainingRecords to delete.
     * @example
     * // Delete a few TrainingRecords
     * const { count } = await prisma.trainingRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrainingRecordDeleteManyArgs>(args?: SelectSubset<T, TrainingRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrainingRecords
     * const trainingRecord = await prisma.trainingRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrainingRecordUpdateManyArgs>(args: SelectSubset<T, TrainingRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingRecords and returns the data updated in the database.
     * @param {TrainingRecordUpdateManyAndReturnArgs} args - Arguments to update many TrainingRecords.
     * @example
     * // Update many TrainingRecords
     * const trainingRecord = await prisma.trainingRecord.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TrainingRecords and only return the `id`
     * const trainingRecordWithIdOnly = await prisma.trainingRecord.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TrainingRecordUpdateManyAndReturnArgs>(args: SelectSubset<T, TrainingRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TrainingRecord.
     * @param {TrainingRecordUpsertArgs} args - Arguments to update or create a TrainingRecord.
     * @example
     * // Update or create a TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.upsert({
     *   create: {
     *     // ... data to create a TrainingRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrainingRecord we want to update
     *   }
     * })
     */
    upsert<T extends TrainingRecordUpsertArgs>(args: SelectSubset<T, TrainingRecordUpsertArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TrainingRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordCountArgs} args - Arguments to filter TrainingRecords to count.
     * @example
     * // Count the number of TrainingRecords
     * const count = await prisma.trainingRecord.count({
     *   where: {
     *     // ... the filter for the TrainingRecords we want to count
     *   }
     * })
    **/
    count<T extends TrainingRecordCountArgs>(
      args?: Subset<T, TrainingRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrainingRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrainingRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrainingRecordAggregateArgs>(args: Subset<T, TrainingRecordAggregateArgs>): Prisma.PrismaPromise<GetTrainingRecordAggregateType<T>>

    /**
     * Group by TrainingRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrainingRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrainingRecordGroupByArgs['orderBy'] }
        : { orderBy?: TrainingRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrainingRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrainingRecord model
   */
  readonly fields: TrainingRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrainingRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrainingRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrainingRecord model
   */
  interface TrainingRecordFieldRefs {
    readonly id: FieldRef<"TrainingRecord", 'String'>
    readonly productId: FieldRef<"TrainingRecord", 'String'>
    readonly taskUuid: FieldRef<"TrainingRecord", 'String'>
    readonly labelName: FieldRef<"TrainingRecord", 'String'>
    readonly modelName: FieldRef<"TrainingRecord", 'String'>
    readonly config: FieldRef<"TrainingRecord", 'String'>
    readonly status: FieldRef<"TrainingRecord", 'String'>
    readonly progress: FieldRef<"TrainingRecord", 'Float'>
    readonly totalEpochs: FieldRef<"TrainingRecord", 'Int'>
    readonly currentEpoch: FieldRef<"TrainingRecord", 'Int'>
    readonly batchSize: FieldRef<"TrainingRecord", 'Int'>
    readonly learningRate: FieldRef<"TrainingRecord", 'Float'>
    readonly latestIter: FieldRef<"TrainingRecord", 'Int'>
    readonly metrics: FieldRef<"TrainingRecord", 'String'>
    readonly logs: FieldRef<"TrainingRecord", 'String'>
    readonly startTime: FieldRef<"TrainingRecord", 'DateTime'>
    readonly endTime: FieldRef<"TrainingRecord", 'DateTime'>
    readonly hasBestModel: FieldRef<"TrainingRecord", 'Boolean'>
    readonly outputPath: FieldRef<"TrainingRecord", 'String'>
    readonly createdAt: FieldRef<"TrainingRecord", 'DateTime'>
    readonly updatedAt: FieldRef<"TrainingRecord", 'DateTime'>
    readonly isRetrain: FieldRef<"TrainingRecord", 'Boolean'>
    readonly baseTaskUuid: FieldRef<"TrainingRecord", 'String'>
    readonly pathId: FieldRef<"TrainingRecord", 'String'>
    readonly taskChain: FieldRef<"TrainingRecord", 'String'>
    readonly generation: FieldRef<"TrainingRecord", 'Int'>
    readonly fpCount: FieldRef<"TrainingRecord", 'Int'>
    readonly fnCount: FieldRef<"TrainingRecord", 'Int'>
    readonly yoloFpCount: FieldRef<"TrainingRecord", 'Int'>
    readonly encoderName: FieldRef<"TrainingRecord", 'String'>
    readonly decoderDepth: FieldRef<"TrainingRecord", 'Int'>
    readonly epochs: FieldRef<"TrainingRecord", 'Int'>
    readonly freezeEncoder: FieldRef<"TrainingRecord", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * TrainingRecord findUnique
   */
  export type TrainingRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Filter, which TrainingRecord to fetch.
     */
    where: TrainingRecordWhereUniqueInput
  }

  /**
   * TrainingRecord findUniqueOrThrow
   */
  export type TrainingRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Filter, which TrainingRecord to fetch.
     */
    where: TrainingRecordWhereUniqueInput
  }

  /**
   * TrainingRecord findFirst
   */
  export type TrainingRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Filter, which TrainingRecord to fetch.
     */
    where?: TrainingRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingRecords to fetch.
     */
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingRecords.
     */
    cursor?: TrainingRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingRecords.
     */
    distinct?: TrainingRecordScalarFieldEnum | TrainingRecordScalarFieldEnum[]
  }

  /**
   * TrainingRecord findFirstOrThrow
   */
  export type TrainingRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Filter, which TrainingRecord to fetch.
     */
    where?: TrainingRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingRecords to fetch.
     */
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingRecords.
     */
    cursor?: TrainingRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingRecords.
     */
    distinct?: TrainingRecordScalarFieldEnum | TrainingRecordScalarFieldEnum[]
  }

  /**
   * TrainingRecord findMany
   */
  export type TrainingRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Filter, which TrainingRecords to fetch.
     */
    where?: TrainingRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingRecords to fetch.
     */
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrainingRecords.
     */
    cursor?: TrainingRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingRecords.
     */
    skip?: number
    distinct?: TrainingRecordScalarFieldEnum | TrainingRecordScalarFieldEnum[]
  }

  /**
   * TrainingRecord create
   */
  export type TrainingRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * The data needed to create a TrainingRecord.
     */
    data: XOR<TrainingRecordCreateInput, TrainingRecordUncheckedCreateInput>
  }

  /**
   * TrainingRecord createMany
   */
  export type TrainingRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrainingRecords.
     */
    data: TrainingRecordCreateManyInput | TrainingRecordCreateManyInput[]
  }

  /**
   * TrainingRecord createManyAndReturn
   */
  export type TrainingRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * The data used to create many TrainingRecords.
     */
    data: TrainingRecordCreateManyInput | TrainingRecordCreateManyInput[]
  }

  /**
   * TrainingRecord update
   */
  export type TrainingRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * The data needed to update a TrainingRecord.
     */
    data: XOR<TrainingRecordUpdateInput, TrainingRecordUncheckedUpdateInput>
    /**
     * Choose, which TrainingRecord to update.
     */
    where: TrainingRecordWhereUniqueInput
  }

  /**
   * TrainingRecord updateMany
   */
  export type TrainingRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrainingRecords.
     */
    data: XOR<TrainingRecordUpdateManyMutationInput, TrainingRecordUncheckedUpdateManyInput>
    /**
     * Filter which TrainingRecords to update
     */
    where?: TrainingRecordWhereInput
    /**
     * Limit how many TrainingRecords to update.
     */
    limit?: number
  }

  /**
   * TrainingRecord updateManyAndReturn
   */
  export type TrainingRecordUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * The data used to update TrainingRecords.
     */
    data: XOR<TrainingRecordUpdateManyMutationInput, TrainingRecordUncheckedUpdateManyInput>
    /**
     * Filter which TrainingRecords to update
     */
    where?: TrainingRecordWhereInput
    /**
     * Limit how many TrainingRecords to update.
     */
    limit?: number
  }

  /**
   * TrainingRecord upsert
   */
  export type TrainingRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * The filter to search for the TrainingRecord to update in case it exists.
     */
    where: TrainingRecordWhereUniqueInput
    /**
     * In case the TrainingRecord found by the `where` argument doesn't exist, create a new TrainingRecord with this data.
     */
    create: XOR<TrainingRecordCreateInput, TrainingRecordUncheckedCreateInput>
    /**
     * In case the TrainingRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrainingRecordUpdateInput, TrainingRecordUncheckedUpdateInput>
  }

  /**
   * TrainingRecord delete
   */
  export type TrainingRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Filter which TrainingRecord to delete.
     */
    where: TrainingRecordWhereUniqueInput
  }

  /**
   * TrainingRecord deleteMany
   */
  export type TrainingRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingRecords to delete
     */
    where?: TrainingRecordWhereInput
    /**
     * Limit how many TrainingRecords to delete.
     */
    limit?: number
  }

  /**
   * TrainingRecord without action
   */
  export type TrainingRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
  }


  /**
   * Model AppSettings
   */

  export type AggregateAppSettings = {
    _count: AppSettingsCountAggregateOutputType | null
    _avg: AppSettingsAvgAggregateOutputType | null
    _sum: AppSettingsSumAggregateOutputType | null
    _min: AppSettingsMinAggregateOutputType | null
    _max: AppSettingsMaxAggregateOutputType | null
  }

  export type AppSettingsAvgAggregateOutputType = {
    id: number | null
  }

  export type AppSettingsSumAggregateOutputType = {
    id: number | null
  }

  export type AppSettingsMinAggregateOutputType = {
    id: number | null
    dataPath: string | null
    locale: string | null
    backendMode: string | null
    backendIp: string | null
    backendUrl: string | null
    backendPort: string | null
    imageSettings: string | null
    modbusSettings: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppSettingsMaxAggregateOutputType = {
    id: number | null
    dataPath: string | null
    locale: string | null
    backendMode: string | null
    backendIp: string | null
    backendUrl: string | null
    backendPort: string | null
    imageSettings: string | null
    modbusSettings: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppSettingsCountAggregateOutputType = {
    id: number
    dataPath: number
    locale: number
    backendMode: number
    backendIp: number
    backendUrl: number
    backendPort: number
    imageSettings: number
    modbusSettings: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AppSettingsAvgAggregateInputType = {
    id?: true
  }

  export type AppSettingsSumAggregateInputType = {
    id?: true
  }

  export type AppSettingsMinAggregateInputType = {
    id?: true
    dataPath?: true
    locale?: true
    backendMode?: true
    backendIp?: true
    backendUrl?: true
    backendPort?: true
    imageSettings?: true
    modbusSettings?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppSettingsMaxAggregateInputType = {
    id?: true
    dataPath?: true
    locale?: true
    backendMode?: true
    backendIp?: true
    backendUrl?: true
    backendPort?: true
    imageSettings?: true
    modbusSettings?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppSettingsCountAggregateInputType = {
    id?: true
    dataPath?: true
    locale?: true
    backendMode?: true
    backendIp?: true
    backendUrl?: true
    backendPort?: true
    imageSettings?: true
    modbusSettings?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AppSettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppSettings to aggregate.
     */
    where?: AppSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingsOrderByWithRelationInput | AppSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppSettings
    **/
    _count?: true | AppSettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AppSettingsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AppSettingsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppSettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppSettingsMaxAggregateInputType
  }

  export type GetAppSettingsAggregateType<T extends AppSettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateAppSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppSettings[P]>
      : GetScalarType<T[P], AggregateAppSettings[P]>
  }




  export type AppSettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppSettingsWhereInput
    orderBy?: AppSettingsOrderByWithAggregationInput | AppSettingsOrderByWithAggregationInput[]
    by: AppSettingsScalarFieldEnum[] | AppSettingsScalarFieldEnum
    having?: AppSettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppSettingsCountAggregateInputType | true
    _avg?: AppSettingsAvgAggregateInputType
    _sum?: AppSettingsSumAggregateInputType
    _min?: AppSettingsMinAggregateInputType
    _max?: AppSettingsMaxAggregateInputType
  }

  export type AppSettingsGroupByOutputType = {
    id: number
    dataPath: string
    locale: string
    backendMode: string
    backendIp: string
    backendUrl: string
    backendPort: string
    imageSettings: string | null
    modbusSettings: string | null
    createdAt: Date
    updatedAt: Date
    _count: AppSettingsCountAggregateOutputType | null
    _avg: AppSettingsAvgAggregateOutputType | null
    _sum: AppSettingsSumAggregateOutputType | null
    _min: AppSettingsMinAggregateOutputType | null
    _max: AppSettingsMaxAggregateOutputType | null
  }

  type GetAppSettingsGroupByPayload<T extends AppSettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppSettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppSettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppSettingsGroupByOutputType[P]>
            : GetScalarType<T[P], AppSettingsGroupByOutputType[P]>
        }
      >
    >


  export type AppSettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dataPath?: boolean
    locale?: boolean
    backendMode?: boolean
    backendIp?: boolean
    backendUrl?: boolean
    backendPort?: boolean
    imageSettings?: boolean
    modbusSettings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appSettings"]>

  export type AppSettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dataPath?: boolean
    locale?: boolean
    backendMode?: boolean
    backendIp?: boolean
    backendUrl?: boolean
    backendPort?: boolean
    imageSettings?: boolean
    modbusSettings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appSettings"]>

  export type AppSettingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dataPath?: boolean
    locale?: boolean
    backendMode?: boolean
    backendIp?: boolean
    backendUrl?: boolean
    backendPort?: boolean
    imageSettings?: boolean
    modbusSettings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appSettings"]>

  export type AppSettingsSelectScalar = {
    id?: boolean
    dataPath?: boolean
    locale?: boolean
    backendMode?: boolean
    backendIp?: boolean
    backendUrl?: boolean
    backendPort?: boolean
    imageSettings?: boolean
    modbusSettings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AppSettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "dataPath" | "locale" | "backendMode" | "backendIp" | "backendUrl" | "backendPort" | "imageSettings" | "modbusSettings" | "createdAt" | "updatedAt", ExtArgs["result"]["appSettings"]>

  export type $AppSettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppSettings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      dataPath: string
      locale: string
      backendMode: string
      backendIp: string
      backendUrl: string
      backendPort: string
      imageSettings: string | null
      modbusSettings: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["appSettings"]>
    composites: {}
  }

  type AppSettingsGetPayload<S extends boolean | null | undefined | AppSettingsDefaultArgs> = $Result.GetResult<Prisma.$AppSettingsPayload, S>

  type AppSettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AppSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AppSettingsCountAggregateInputType | true
    }

  export interface AppSettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppSettings'], meta: { name: 'AppSettings' } }
    /**
     * Find zero or one AppSettings that matches the filter.
     * @param {AppSettingsFindUniqueArgs} args - Arguments to find a AppSettings
     * @example
     * // Get one AppSettings
     * const appSettings = await prisma.appSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppSettingsFindUniqueArgs>(args: SelectSubset<T, AppSettingsFindUniqueArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AppSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AppSettingsFindUniqueOrThrowArgs} args - Arguments to find a AppSettings
     * @example
     * // Get one AppSettings
     * const appSettings = await prisma.appSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppSettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, AppSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AppSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsFindFirstArgs} args - Arguments to find a AppSettings
     * @example
     * // Get one AppSettings
     * const appSettings = await prisma.appSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppSettingsFindFirstArgs>(args?: SelectSubset<T, AppSettingsFindFirstArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AppSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsFindFirstOrThrowArgs} args - Arguments to find a AppSettings
     * @example
     * // Get one AppSettings
     * const appSettings = await prisma.appSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppSettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, AppSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AppSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppSettings
     * const appSettings = await prisma.appSettings.findMany()
     * 
     * // Get first 10 AppSettings
     * const appSettings = await prisma.appSettings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appSettingsWithIdOnly = await prisma.appSettings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AppSettingsFindManyArgs>(args?: SelectSubset<T, AppSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AppSettings.
     * @param {AppSettingsCreateArgs} args - Arguments to create a AppSettings.
     * @example
     * // Create one AppSettings
     * const AppSettings = await prisma.appSettings.create({
     *   data: {
     *     // ... data to create a AppSettings
     *   }
     * })
     * 
     */
    create<T extends AppSettingsCreateArgs>(args: SelectSubset<T, AppSettingsCreateArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AppSettings.
     * @param {AppSettingsCreateManyArgs} args - Arguments to create many AppSettings.
     * @example
     * // Create many AppSettings
     * const appSettings = await prisma.appSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppSettingsCreateManyArgs>(args?: SelectSubset<T, AppSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppSettings and returns the data saved in the database.
     * @param {AppSettingsCreateManyAndReturnArgs} args - Arguments to create many AppSettings.
     * @example
     * // Create many AppSettings
     * const appSettings = await prisma.appSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppSettings and only return the `id`
     * const appSettingsWithIdOnly = await prisma.appSettings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppSettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, AppSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AppSettings.
     * @param {AppSettingsDeleteArgs} args - Arguments to delete one AppSettings.
     * @example
     * // Delete one AppSettings
     * const AppSettings = await prisma.appSettings.delete({
     *   where: {
     *     // ... filter to delete one AppSettings
     *   }
     * })
     * 
     */
    delete<T extends AppSettingsDeleteArgs>(args: SelectSubset<T, AppSettingsDeleteArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AppSettings.
     * @param {AppSettingsUpdateArgs} args - Arguments to update one AppSettings.
     * @example
     * // Update one AppSettings
     * const appSettings = await prisma.appSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppSettingsUpdateArgs>(args: SelectSubset<T, AppSettingsUpdateArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AppSettings.
     * @param {AppSettingsDeleteManyArgs} args - Arguments to filter AppSettings to delete.
     * @example
     * // Delete a few AppSettings
     * const { count } = await prisma.appSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppSettingsDeleteManyArgs>(args?: SelectSubset<T, AppSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppSettings
     * const appSettings = await prisma.appSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppSettingsUpdateManyArgs>(args: SelectSubset<T, AppSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppSettings and returns the data updated in the database.
     * @param {AppSettingsUpdateManyAndReturnArgs} args - Arguments to update many AppSettings.
     * @example
     * // Update many AppSettings
     * const appSettings = await prisma.appSettings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AppSettings and only return the `id`
     * const appSettingsWithIdOnly = await prisma.appSettings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AppSettingsUpdateManyAndReturnArgs>(args: SelectSubset<T, AppSettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AppSettings.
     * @param {AppSettingsUpsertArgs} args - Arguments to update or create a AppSettings.
     * @example
     * // Update or create a AppSettings
     * const appSettings = await prisma.appSettings.upsert({
     *   create: {
     *     // ... data to create a AppSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppSettings we want to update
     *   }
     * })
     */
    upsert<T extends AppSettingsUpsertArgs>(args: SelectSubset<T, AppSettingsUpsertArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsCountArgs} args - Arguments to filter AppSettings to count.
     * @example
     * // Count the number of AppSettings
     * const count = await prisma.appSettings.count({
     *   where: {
     *     // ... the filter for the AppSettings we want to count
     *   }
     * })
    **/
    count<T extends AppSettingsCountArgs>(
      args?: Subset<T, AppSettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppSettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppSettingsAggregateArgs>(args: Subset<T, AppSettingsAggregateArgs>): Prisma.PrismaPromise<GetAppSettingsAggregateType<T>>

    /**
     * Group by AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppSettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppSettingsGroupByArgs['orderBy'] }
        : { orderBy?: AppSettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppSettings model
   */
  readonly fields: AppSettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppSettings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppSettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AppSettings model
   */
  interface AppSettingsFieldRefs {
    readonly id: FieldRef<"AppSettings", 'Int'>
    readonly dataPath: FieldRef<"AppSettings", 'String'>
    readonly locale: FieldRef<"AppSettings", 'String'>
    readonly backendMode: FieldRef<"AppSettings", 'String'>
    readonly backendIp: FieldRef<"AppSettings", 'String'>
    readonly backendUrl: FieldRef<"AppSettings", 'String'>
    readonly backendPort: FieldRef<"AppSettings", 'String'>
    readonly imageSettings: FieldRef<"AppSettings", 'String'>
    readonly modbusSettings: FieldRef<"AppSettings", 'String'>
    readonly createdAt: FieldRef<"AppSettings", 'DateTime'>
    readonly updatedAt: FieldRef<"AppSettings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppSettings findUnique
   */
  export type AppSettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where: AppSettingsWhereUniqueInput
  }

  /**
   * AppSettings findUniqueOrThrow
   */
  export type AppSettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where: AppSettingsWhereUniqueInput
  }

  /**
   * AppSettings findFirst
   */
  export type AppSettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where?: AppSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingsOrderByWithRelationInput | AppSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppSettings.
     */
    cursor?: AppSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppSettings.
     */
    distinct?: AppSettingsScalarFieldEnum | AppSettingsScalarFieldEnum[]
  }

  /**
   * AppSettings findFirstOrThrow
   */
  export type AppSettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where?: AppSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingsOrderByWithRelationInput | AppSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppSettings.
     */
    cursor?: AppSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppSettings.
     */
    distinct?: AppSettingsScalarFieldEnum | AppSettingsScalarFieldEnum[]
  }

  /**
   * AppSettings findMany
   */
  export type AppSettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where?: AppSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingsOrderByWithRelationInput | AppSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppSettings.
     */
    cursor?: AppSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    distinct?: AppSettingsScalarFieldEnum | AppSettingsScalarFieldEnum[]
  }

  /**
   * AppSettings create
   */
  export type AppSettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * The data needed to create a AppSettings.
     */
    data: XOR<AppSettingsCreateInput, AppSettingsUncheckedCreateInput>
  }

  /**
   * AppSettings createMany
   */
  export type AppSettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppSettings.
     */
    data: AppSettingsCreateManyInput | AppSettingsCreateManyInput[]
  }

  /**
   * AppSettings createManyAndReturn
   */
  export type AppSettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * The data used to create many AppSettings.
     */
    data: AppSettingsCreateManyInput | AppSettingsCreateManyInput[]
  }

  /**
   * AppSettings update
   */
  export type AppSettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * The data needed to update a AppSettings.
     */
    data: XOR<AppSettingsUpdateInput, AppSettingsUncheckedUpdateInput>
    /**
     * Choose, which AppSettings to update.
     */
    where: AppSettingsWhereUniqueInput
  }

  /**
   * AppSettings updateMany
   */
  export type AppSettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppSettings.
     */
    data: XOR<AppSettingsUpdateManyMutationInput, AppSettingsUncheckedUpdateManyInput>
    /**
     * Filter which AppSettings to update
     */
    where?: AppSettingsWhereInput
    /**
     * Limit how many AppSettings to update.
     */
    limit?: number
  }

  /**
   * AppSettings updateManyAndReturn
   */
  export type AppSettingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * The data used to update AppSettings.
     */
    data: XOR<AppSettingsUpdateManyMutationInput, AppSettingsUncheckedUpdateManyInput>
    /**
     * Filter which AppSettings to update
     */
    where?: AppSettingsWhereInput
    /**
     * Limit how many AppSettings to update.
     */
    limit?: number
  }

  /**
   * AppSettings upsert
   */
  export type AppSettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * The filter to search for the AppSettings to update in case it exists.
     */
    where: AppSettingsWhereUniqueInput
    /**
     * In case the AppSettings found by the `where` argument doesn't exist, create a new AppSettings with this data.
     */
    create: XOR<AppSettingsCreateInput, AppSettingsUncheckedCreateInput>
    /**
     * In case the AppSettings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppSettingsUpdateInput, AppSettingsUncheckedUpdateInput>
  }

  /**
   * AppSettings delete
   */
  export type AppSettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
    /**
     * Filter which AppSettings to delete.
     */
    where: AppSettingsWhereUniqueInput
  }

  /**
   * AppSettings deleteMany
   */
  export type AppSettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppSettings to delete
     */
    where?: AppSettingsWhereInput
    /**
     * Limit how many AppSettings to delete.
     */
    limit?: number
  }

  /**
   * AppSettings without action
   */
  export type AppSettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSettings
     */
    omit?: AppSettingsOmit<ExtArgs> | null
  }


  /**
   * Model RoiImage
   */

  export type AggregateRoiImage = {
    _count: RoiImageCountAggregateOutputType | null
    _avg: RoiImageAvgAggregateOutputType | null
    _sum: RoiImageSumAggregateOutputType | null
    _min: RoiImageMinAggregateOutputType | null
    _max: RoiImageMaxAggregateOutputType | null
  }

  export type RoiImageAvgAggregateOutputType = {
    dinomalyScore: number | null
    generation: number | null
  }

  export type RoiImageSumAggregateOutputType = {
    dinomalyScore: number | null
    generation: number | null
  }

  export type RoiImageMinAggregateOutputType = {
    id: string | null
    productId: string | null
    sourceTaskUuid: string | null
    category: string | null
    modelIsAnomaly: boolean | null
    userIsAnomaly: boolean | null
    isYoloAnomaly: boolean | null
    dinomalyScore: number | null
    roiType: string | null
    filePath: string | null
    fileName: string | null
    thumbnailPath: string | null
    usedInRetrain: boolean | null
    usedTaskUuid: string | null
    usedAt: Date | null
    posId: string | null
    generation: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RoiImageMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    sourceTaskUuid: string | null
    category: string | null
    modelIsAnomaly: boolean | null
    userIsAnomaly: boolean | null
    isYoloAnomaly: boolean | null
    dinomalyScore: number | null
    roiType: string | null
    filePath: string | null
    fileName: string | null
    thumbnailPath: string | null
    usedInRetrain: boolean | null
    usedTaskUuid: string | null
    usedAt: Date | null
    posId: string | null
    generation: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RoiImageCountAggregateOutputType = {
    id: number
    productId: number
    sourceTaskUuid: number
    category: number
    modelIsAnomaly: number
    userIsAnomaly: number
    isYoloAnomaly: number
    dinomalyScore: number
    roiType: number
    filePath: number
    fileName: number
    thumbnailPath: number
    usedInRetrain: number
    usedTaskUuid: number
    usedAt: number
    posId: number
    generation: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RoiImageAvgAggregateInputType = {
    dinomalyScore?: true
    generation?: true
  }

  export type RoiImageSumAggregateInputType = {
    dinomalyScore?: true
    generation?: true
  }

  export type RoiImageMinAggregateInputType = {
    id?: true
    productId?: true
    sourceTaskUuid?: true
    category?: true
    modelIsAnomaly?: true
    userIsAnomaly?: true
    isYoloAnomaly?: true
    dinomalyScore?: true
    roiType?: true
    filePath?: true
    fileName?: true
    thumbnailPath?: true
    usedInRetrain?: true
    usedTaskUuid?: true
    usedAt?: true
    posId?: true
    generation?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RoiImageMaxAggregateInputType = {
    id?: true
    productId?: true
    sourceTaskUuid?: true
    category?: true
    modelIsAnomaly?: true
    userIsAnomaly?: true
    isYoloAnomaly?: true
    dinomalyScore?: true
    roiType?: true
    filePath?: true
    fileName?: true
    thumbnailPath?: true
    usedInRetrain?: true
    usedTaskUuid?: true
    usedAt?: true
    posId?: true
    generation?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RoiImageCountAggregateInputType = {
    id?: true
    productId?: true
    sourceTaskUuid?: true
    category?: true
    modelIsAnomaly?: true
    userIsAnomaly?: true
    isYoloAnomaly?: true
    dinomalyScore?: true
    roiType?: true
    filePath?: true
    fileName?: true
    thumbnailPath?: true
    usedInRetrain?: true
    usedTaskUuid?: true
    usedAt?: true
    posId?: true
    generation?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RoiImageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RoiImage to aggregate.
     */
    where?: RoiImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoiImages to fetch.
     */
    orderBy?: RoiImageOrderByWithRelationInput | RoiImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoiImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoiImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoiImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RoiImages
    **/
    _count?: true | RoiImageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RoiImageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RoiImageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoiImageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoiImageMaxAggregateInputType
  }

  export type GetRoiImageAggregateType<T extends RoiImageAggregateArgs> = {
        [P in keyof T & keyof AggregateRoiImage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoiImage[P]>
      : GetScalarType<T[P], AggregateRoiImage[P]>
  }




  export type RoiImageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoiImageWhereInput
    orderBy?: RoiImageOrderByWithAggregationInput | RoiImageOrderByWithAggregationInput[]
    by: RoiImageScalarFieldEnum[] | RoiImageScalarFieldEnum
    having?: RoiImageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoiImageCountAggregateInputType | true
    _avg?: RoiImageAvgAggregateInputType
    _sum?: RoiImageSumAggregateInputType
    _min?: RoiImageMinAggregateInputType
    _max?: RoiImageMaxAggregateInputType
  }

  export type RoiImageGroupByOutputType = {
    id: string
    productId: string
    sourceTaskUuid: string
    category: string
    modelIsAnomaly: boolean
    userIsAnomaly: boolean
    isYoloAnomaly: boolean
    dinomalyScore: number | null
    roiType: string
    filePath: string
    fileName: string
    thumbnailPath: string | null
    usedInRetrain: boolean
    usedTaskUuid: string | null
    usedAt: Date | null
    posId: string | null
    generation: number
    createdAt: Date
    updatedAt: Date
    _count: RoiImageCountAggregateOutputType | null
    _avg: RoiImageAvgAggregateOutputType | null
    _sum: RoiImageSumAggregateOutputType | null
    _min: RoiImageMinAggregateOutputType | null
    _max: RoiImageMaxAggregateOutputType | null
  }

  type GetRoiImageGroupByPayload<T extends RoiImageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoiImageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoiImageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoiImageGroupByOutputType[P]>
            : GetScalarType<T[P], RoiImageGroupByOutputType[P]>
        }
      >
    >


  export type RoiImageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    sourceTaskUuid?: boolean
    category?: boolean
    modelIsAnomaly?: boolean
    userIsAnomaly?: boolean
    isYoloAnomaly?: boolean
    dinomalyScore?: boolean
    roiType?: boolean
    filePath?: boolean
    fileName?: boolean
    thumbnailPath?: boolean
    usedInRetrain?: boolean
    usedTaskUuid?: boolean
    usedAt?: boolean
    posId?: boolean
    generation?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["roiImage"]>

  export type RoiImageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    sourceTaskUuid?: boolean
    category?: boolean
    modelIsAnomaly?: boolean
    userIsAnomaly?: boolean
    isYoloAnomaly?: boolean
    dinomalyScore?: boolean
    roiType?: boolean
    filePath?: boolean
    fileName?: boolean
    thumbnailPath?: boolean
    usedInRetrain?: boolean
    usedTaskUuid?: boolean
    usedAt?: boolean
    posId?: boolean
    generation?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["roiImage"]>

  export type RoiImageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    sourceTaskUuid?: boolean
    category?: boolean
    modelIsAnomaly?: boolean
    userIsAnomaly?: boolean
    isYoloAnomaly?: boolean
    dinomalyScore?: boolean
    roiType?: boolean
    filePath?: boolean
    fileName?: boolean
    thumbnailPath?: boolean
    usedInRetrain?: boolean
    usedTaskUuid?: boolean
    usedAt?: boolean
    posId?: boolean
    generation?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["roiImage"]>

  export type RoiImageSelectScalar = {
    id?: boolean
    productId?: boolean
    sourceTaskUuid?: boolean
    category?: boolean
    modelIsAnomaly?: boolean
    userIsAnomaly?: boolean
    isYoloAnomaly?: boolean
    dinomalyScore?: boolean
    roiType?: boolean
    filePath?: boolean
    fileName?: boolean
    thumbnailPath?: boolean
    usedInRetrain?: boolean
    usedTaskUuid?: boolean
    usedAt?: boolean
    posId?: boolean
    generation?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RoiImageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "productId" | "sourceTaskUuid" | "category" | "modelIsAnomaly" | "userIsAnomaly" | "isYoloAnomaly" | "dinomalyScore" | "roiType" | "filePath" | "fileName" | "thumbnailPath" | "usedInRetrain" | "usedTaskUuid" | "usedAt" | "posId" | "generation" | "createdAt" | "updatedAt", ExtArgs["result"]["roiImage"]>

  export type $RoiImagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RoiImage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      sourceTaskUuid: string
      category: string
      modelIsAnomaly: boolean
      userIsAnomaly: boolean
      isYoloAnomaly: boolean
      dinomalyScore: number | null
      roiType: string
      filePath: string
      fileName: string
      thumbnailPath: string | null
      usedInRetrain: boolean
      usedTaskUuid: string | null
      usedAt: Date | null
      posId: string | null
      generation: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["roiImage"]>
    composites: {}
  }

  type RoiImageGetPayload<S extends boolean | null | undefined | RoiImageDefaultArgs> = $Result.GetResult<Prisma.$RoiImagePayload, S>

  type RoiImageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoiImageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoiImageCountAggregateInputType | true
    }

  export interface RoiImageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RoiImage'], meta: { name: 'RoiImage' } }
    /**
     * Find zero or one RoiImage that matches the filter.
     * @param {RoiImageFindUniqueArgs} args - Arguments to find a RoiImage
     * @example
     * // Get one RoiImage
     * const roiImage = await prisma.roiImage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoiImageFindUniqueArgs>(args: SelectSubset<T, RoiImageFindUniqueArgs<ExtArgs>>): Prisma__RoiImageClient<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RoiImage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoiImageFindUniqueOrThrowArgs} args - Arguments to find a RoiImage
     * @example
     * // Get one RoiImage
     * const roiImage = await prisma.roiImage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoiImageFindUniqueOrThrowArgs>(args: SelectSubset<T, RoiImageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoiImageClient<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RoiImage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoiImageFindFirstArgs} args - Arguments to find a RoiImage
     * @example
     * // Get one RoiImage
     * const roiImage = await prisma.roiImage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoiImageFindFirstArgs>(args?: SelectSubset<T, RoiImageFindFirstArgs<ExtArgs>>): Prisma__RoiImageClient<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RoiImage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoiImageFindFirstOrThrowArgs} args - Arguments to find a RoiImage
     * @example
     * // Get one RoiImage
     * const roiImage = await prisma.roiImage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoiImageFindFirstOrThrowArgs>(args?: SelectSubset<T, RoiImageFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoiImageClient<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RoiImages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoiImageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RoiImages
     * const roiImages = await prisma.roiImage.findMany()
     * 
     * // Get first 10 RoiImages
     * const roiImages = await prisma.roiImage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roiImageWithIdOnly = await prisma.roiImage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoiImageFindManyArgs>(args?: SelectSubset<T, RoiImageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RoiImage.
     * @param {RoiImageCreateArgs} args - Arguments to create a RoiImage.
     * @example
     * // Create one RoiImage
     * const RoiImage = await prisma.roiImage.create({
     *   data: {
     *     // ... data to create a RoiImage
     *   }
     * })
     * 
     */
    create<T extends RoiImageCreateArgs>(args: SelectSubset<T, RoiImageCreateArgs<ExtArgs>>): Prisma__RoiImageClient<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RoiImages.
     * @param {RoiImageCreateManyArgs} args - Arguments to create many RoiImages.
     * @example
     * // Create many RoiImages
     * const roiImage = await prisma.roiImage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoiImageCreateManyArgs>(args?: SelectSubset<T, RoiImageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RoiImages and returns the data saved in the database.
     * @param {RoiImageCreateManyAndReturnArgs} args - Arguments to create many RoiImages.
     * @example
     * // Create many RoiImages
     * const roiImage = await prisma.roiImage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RoiImages and only return the `id`
     * const roiImageWithIdOnly = await prisma.roiImage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoiImageCreateManyAndReturnArgs>(args?: SelectSubset<T, RoiImageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RoiImage.
     * @param {RoiImageDeleteArgs} args - Arguments to delete one RoiImage.
     * @example
     * // Delete one RoiImage
     * const RoiImage = await prisma.roiImage.delete({
     *   where: {
     *     // ... filter to delete one RoiImage
     *   }
     * })
     * 
     */
    delete<T extends RoiImageDeleteArgs>(args: SelectSubset<T, RoiImageDeleteArgs<ExtArgs>>): Prisma__RoiImageClient<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RoiImage.
     * @param {RoiImageUpdateArgs} args - Arguments to update one RoiImage.
     * @example
     * // Update one RoiImage
     * const roiImage = await prisma.roiImage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoiImageUpdateArgs>(args: SelectSubset<T, RoiImageUpdateArgs<ExtArgs>>): Prisma__RoiImageClient<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RoiImages.
     * @param {RoiImageDeleteManyArgs} args - Arguments to filter RoiImages to delete.
     * @example
     * // Delete a few RoiImages
     * const { count } = await prisma.roiImage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoiImageDeleteManyArgs>(args?: SelectSubset<T, RoiImageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RoiImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoiImageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RoiImages
     * const roiImage = await prisma.roiImage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoiImageUpdateManyArgs>(args: SelectSubset<T, RoiImageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RoiImages and returns the data updated in the database.
     * @param {RoiImageUpdateManyAndReturnArgs} args - Arguments to update many RoiImages.
     * @example
     * // Update many RoiImages
     * const roiImage = await prisma.roiImage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RoiImages and only return the `id`
     * const roiImageWithIdOnly = await prisma.roiImage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RoiImageUpdateManyAndReturnArgs>(args: SelectSubset<T, RoiImageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RoiImage.
     * @param {RoiImageUpsertArgs} args - Arguments to update or create a RoiImage.
     * @example
     * // Update or create a RoiImage
     * const roiImage = await prisma.roiImage.upsert({
     *   create: {
     *     // ... data to create a RoiImage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RoiImage we want to update
     *   }
     * })
     */
    upsert<T extends RoiImageUpsertArgs>(args: SelectSubset<T, RoiImageUpsertArgs<ExtArgs>>): Prisma__RoiImageClient<$Result.GetResult<Prisma.$RoiImagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RoiImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoiImageCountArgs} args - Arguments to filter RoiImages to count.
     * @example
     * // Count the number of RoiImages
     * const count = await prisma.roiImage.count({
     *   where: {
     *     // ... the filter for the RoiImages we want to count
     *   }
     * })
    **/
    count<T extends RoiImageCountArgs>(
      args?: Subset<T, RoiImageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoiImageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RoiImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoiImageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoiImageAggregateArgs>(args: Subset<T, RoiImageAggregateArgs>): Prisma.PrismaPromise<GetRoiImageAggregateType<T>>

    /**
     * Group by RoiImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoiImageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoiImageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoiImageGroupByArgs['orderBy'] }
        : { orderBy?: RoiImageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoiImageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoiImageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RoiImage model
   */
  readonly fields: RoiImageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RoiImage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoiImageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RoiImage model
   */
  interface RoiImageFieldRefs {
    readonly id: FieldRef<"RoiImage", 'String'>
    readonly productId: FieldRef<"RoiImage", 'String'>
    readonly sourceTaskUuid: FieldRef<"RoiImage", 'String'>
    readonly category: FieldRef<"RoiImage", 'String'>
    readonly modelIsAnomaly: FieldRef<"RoiImage", 'Boolean'>
    readonly userIsAnomaly: FieldRef<"RoiImage", 'Boolean'>
    readonly isYoloAnomaly: FieldRef<"RoiImage", 'Boolean'>
    readonly dinomalyScore: FieldRef<"RoiImage", 'Float'>
    readonly roiType: FieldRef<"RoiImage", 'String'>
    readonly filePath: FieldRef<"RoiImage", 'String'>
    readonly fileName: FieldRef<"RoiImage", 'String'>
    readonly thumbnailPath: FieldRef<"RoiImage", 'String'>
    readonly usedInRetrain: FieldRef<"RoiImage", 'Boolean'>
    readonly usedTaskUuid: FieldRef<"RoiImage", 'String'>
    readonly usedAt: FieldRef<"RoiImage", 'DateTime'>
    readonly posId: FieldRef<"RoiImage", 'String'>
    readonly generation: FieldRef<"RoiImage", 'Int'>
    readonly createdAt: FieldRef<"RoiImage", 'DateTime'>
    readonly updatedAt: FieldRef<"RoiImage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RoiImage findUnique
   */
  export type RoiImageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * Filter, which RoiImage to fetch.
     */
    where: RoiImageWhereUniqueInput
  }

  /**
   * RoiImage findUniqueOrThrow
   */
  export type RoiImageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * Filter, which RoiImage to fetch.
     */
    where: RoiImageWhereUniqueInput
  }

  /**
   * RoiImage findFirst
   */
  export type RoiImageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * Filter, which RoiImage to fetch.
     */
    where?: RoiImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoiImages to fetch.
     */
    orderBy?: RoiImageOrderByWithRelationInput | RoiImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RoiImages.
     */
    cursor?: RoiImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoiImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoiImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RoiImages.
     */
    distinct?: RoiImageScalarFieldEnum | RoiImageScalarFieldEnum[]
  }

  /**
   * RoiImage findFirstOrThrow
   */
  export type RoiImageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * Filter, which RoiImage to fetch.
     */
    where?: RoiImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoiImages to fetch.
     */
    orderBy?: RoiImageOrderByWithRelationInput | RoiImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RoiImages.
     */
    cursor?: RoiImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoiImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoiImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RoiImages.
     */
    distinct?: RoiImageScalarFieldEnum | RoiImageScalarFieldEnum[]
  }

  /**
   * RoiImage findMany
   */
  export type RoiImageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * Filter, which RoiImages to fetch.
     */
    where?: RoiImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoiImages to fetch.
     */
    orderBy?: RoiImageOrderByWithRelationInput | RoiImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RoiImages.
     */
    cursor?: RoiImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoiImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoiImages.
     */
    skip?: number
    distinct?: RoiImageScalarFieldEnum | RoiImageScalarFieldEnum[]
  }

  /**
   * RoiImage create
   */
  export type RoiImageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * The data needed to create a RoiImage.
     */
    data: XOR<RoiImageCreateInput, RoiImageUncheckedCreateInput>
  }

  /**
   * RoiImage createMany
   */
  export type RoiImageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RoiImages.
     */
    data: RoiImageCreateManyInput | RoiImageCreateManyInput[]
  }

  /**
   * RoiImage createManyAndReturn
   */
  export type RoiImageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * The data used to create many RoiImages.
     */
    data: RoiImageCreateManyInput | RoiImageCreateManyInput[]
  }

  /**
   * RoiImage update
   */
  export type RoiImageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * The data needed to update a RoiImage.
     */
    data: XOR<RoiImageUpdateInput, RoiImageUncheckedUpdateInput>
    /**
     * Choose, which RoiImage to update.
     */
    where: RoiImageWhereUniqueInput
  }

  /**
   * RoiImage updateMany
   */
  export type RoiImageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RoiImages.
     */
    data: XOR<RoiImageUpdateManyMutationInput, RoiImageUncheckedUpdateManyInput>
    /**
     * Filter which RoiImages to update
     */
    where?: RoiImageWhereInput
    /**
     * Limit how many RoiImages to update.
     */
    limit?: number
  }

  /**
   * RoiImage updateManyAndReturn
   */
  export type RoiImageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * The data used to update RoiImages.
     */
    data: XOR<RoiImageUpdateManyMutationInput, RoiImageUncheckedUpdateManyInput>
    /**
     * Filter which RoiImages to update
     */
    where?: RoiImageWhereInput
    /**
     * Limit how many RoiImages to update.
     */
    limit?: number
  }

  /**
   * RoiImage upsert
   */
  export type RoiImageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * The filter to search for the RoiImage to update in case it exists.
     */
    where: RoiImageWhereUniqueInput
    /**
     * In case the RoiImage found by the `where` argument doesn't exist, create a new RoiImage with this data.
     */
    create: XOR<RoiImageCreateInput, RoiImageUncheckedCreateInput>
    /**
     * In case the RoiImage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoiImageUpdateInput, RoiImageUncheckedUpdateInput>
  }

  /**
   * RoiImage delete
   */
  export type RoiImageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
    /**
     * Filter which RoiImage to delete.
     */
    where: RoiImageWhereUniqueInput
  }

  /**
   * RoiImage deleteMany
   */
  export type RoiImageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RoiImages to delete
     */
    where?: RoiImageWhereInput
    /**
     * Limit how many RoiImages to delete.
     */
    limit?: number
  }

  /**
   * RoiImage without action
   */
  export type RoiImageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoiImage
     */
    select?: RoiImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoiImage
     */
    omit?: RoiImageOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    model: 'model',
    lastImagePath: 'lastImagePath',
    cameraId: 'cameraId',
    schemeId: 'schemeId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const AnnotationSchemeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    config: 'config',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AnnotationSchemeScalarFieldEnum = (typeof AnnotationSchemeScalarFieldEnum)[keyof typeof AnnotationSchemeScalarFieldEnum]


  export const AnnotationScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    imagePath: 'imagePath',
    data: 'data',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AnnotationScalarFieldEnum = (typeof AnnotationScalarFieldEnum)[keyof typeof AnnotationScalarFieldEnum]


  export const DatasetVersionScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    displayName: 'displayName',
    versionName: 'versionName',
    moduleName: 'moduleName',
    savePath: 'savePath',
    imageCount: 'imageCount',
    config: 'config',
    createdAt: 'createdAt'
  };

  export type DatasetVersionScalarFieldEnum = (typeof DatasetVersionScalarFieldEnum)[keyof typeof DatasetVersionScalarFieldEnum]


  export const CameraScalarFieldEnum: {
    id: 'id',
    name: 'name',
    ip: 'ip',
    status: 'status',
    config: 'config',
    isEnabled: 'isEnabled',
    isNetworkCamera: 'isNetworkCamera',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CameraScalarFieldEnum = (typeof CameraScalarFieldEnum)[keyof typeof CameraScalarFieldEnum]


  export const TrainingRecordScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    taskUuid: 'taskUuid',
    labelName: 'labelName',
    modelName: 'modelName',
    config: 'config',
    status: 'status',
    progress: 'progress',
    totalEpochs: 'totalEpochs',
    currentEpoch: 'currentEpoch',
    batchSize: 'batchSize',
    learningRate: 'learningRate',
    latestIter: 'latestIter',
    metrics: 'metrics',
    logs: 'logs',
    startTime: 'startTime',
    endTime: 'endTime',
    hasBestModel: 'hasBestModel',
    outputPath: 'outputPath',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    isRetrain: 'isRetrain',
    baseTaskUuid: 'baseTaskUuid',
    pathId: 'pathId',
    taskChain: 'taskChain',
    generation: 'generation',
    fpCount: 'fpCount',
    fnCount: 'fnCount',
    yoloFpCount: 'yoloFpCount',
    encoderName: 'encoderName',
    decoderDepth: 'decoderDepth',
    epochs: 'epochs',
    freezeEncoder: 'freezeEncoder'
  };

  export type TrainingRecordScalarFieldEnum = (typeof TrainingRecordScalarFieldEnum)[keyof typeof TrainingRecordScalarFieldEnum]


  export const AppSettingsScalarFieldEnum: {
    id: 'id',
    dataPath: 'dataPath',
    locale: 'locale',
    backendMode: 'backendMode',
    backendIp: 'backendIp',
    backendUrl: 'backendUrl',
    backendPort: 'backendPort',
    imageSettings: 'imageSettings',
    modbusSettings: 'modbusSettings',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AppSettingsScalarFieldEnum = (typeof AppSettingsScalarFieldEnum)[keyof typeof AppSettingsScalarFieldEnum]


  export const RoiImageScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    sourceTaskUuid: 'sourceTaskUuid',
    category: 'category',
    modelIsAnomaly: 'modelIsAnomaly',
    userIsAnomaly: 'userIsAnomaly',
    isYoloAnomaly: 'isYoloAnomaly',
    dinomalyScore: 'dinomalyScore',
    roiType: 'roiType',
    filePath: 'filePath',
    fileName: 'fileName',
    thumbnailPath: 'thumbnailPath',
    usedInRetrain: 'usedInRetrain',
    usedTaskUuid: 'usedTaskUuid',
    usedAt: 'usedAt',
    posId: 'posId',
    generation: 'generation',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RoiImageScalarFieldEnum = (typeof RoiImageScalarFieldEnum)[keyof typeof RoiImageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    model?: StringFilter<"Product"> | string
    lastImagePath?: StringNullableFilter<"Product"> | string | null
    cameraId?: StringNullableFilter<"Product"> | string | null
    schemeId?: StringNullableFilter<"Product"> | string | null
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    scheme?: XOR<AnnotationSchemeNullableScalarRelationFilter, AnnotationSchemeWhereInput> | null
    annotations?: AnnotationListRelationFilter
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    model?: SortOrder
    lastImagePath?: SortOrderInput | SortOrder
    cameraId?: SortOrderInput | SortOrder
    schemeId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    scheme?: AnnotationSchemeOrderByWithRelationInput
    annotations?: AnnotationOrderByRelationAggregateInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    model?: StringFilter<"Product"> | string
    lastImagePath?: StringNullableFilter<"Product"> | string | null
    cameraId?: StringNullableFilter<"Product"> | string | null
    schemeId?: StringNullableFilter<"Product"> | string | null
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    scheme?: XOR<AnnotationSchemeNullableScalarRelationFilter, AnnotationSchemeWhereInput> | null
    annotations?: AnnotationListRelationFilter
  }, "id">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    model?: SortOrder
    lastImagePath?: SortOrderInput | SortOrder
    cameraId?: SortOrderInput | SortOrder
    schemeId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    model?: StringWithAggregatesFilter<"Product"> | string
    lastImagePath?: StringNullableWithAggregatesFilter<"Product"> | string | null
    cameraId?: StringNullableWithAggregatesFilter<"Product"> | string | null
    schemeId?: StringNullableWithAggregatesFilter<"Product"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
  }

  export type AnnotationSchemeWhereInput = {
    AND?: AnnotationSchemeWhereInput | AnnotationSchemeWhereInput[]
    OR?: AnnotationSchemeWhereInput[]
    NOT?: AnnotationSchemeWhereInput | AnnotationSchemeWhereInput[]
    id?: StringFilter<"AnnotationScheme"> | string
    name?: StringFilter<"AnnotationScheme"> | string
    config?: StringFilter<"AnnotationScheme"> | string
    createdAt?: DateTimeFilter<"AnnotationScheme"> | Date | string
    updatedAt?: DateTimeFilter<"AnnotationScheme"> | Date | string
    products?: ProductListRelationFilter
  }

  export type AnnotationSchemeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    products?: ProductOrderByRelationAggregateInput
  }

  export type AnnotationSchemeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: AnnotationSchemeWhereInput | AnnotationSchemeWhereInput[]
    OR?: AnnotationSchemeWhereInput[]
    NOT?: AnnotationSchemeWhereInput | AnnotationSchemeWhereInput[]
    config?: StringFilter<"AnnotationScheme"> | string
    createdAt?: DateTimeFilter<"AnnotationScheme"> | Date | string
    updatedAt?: DateTimeFilter<"AnnotationScheme"> | Date | string
    products?: ProductListRelationFilter
  }, "id" | "name">

  export type AnnotationSchemeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AnnotationSchemeCountOrderByAggregateInput
    _max?: AnnotationSchemeMaxOrderByAggregateInput
    _min?: AnnotationSchemeMinOrderByAggregateInput
  }

  export type AnnotationSchemeScalarWhereWithAggregatesInput = {
    AND?: AnnotationSchemeScalarWhereWithAggregatesInput | AnnotationSchemeScalarWhereWithAggregatesInput[]
    OR?: AnnotationSchemeScalarWhereWithAggregatesInput[]
    NOT?: AnnotationSchemeScalarWhereWithAggregatesInput | AnnotationSchemeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AnnotationScheme"> | string
    name?: StringWithAggregatesFilter<"AnnotationScheme"> | string
    config?: StringWithAggregatesFilter<"AnnotationScheme"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AnnotationScheme"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AnnotationScheme"> | Date | string
  }

  export type AnnotationWhereInput = {
    AND?: AnnotationWhereInput | AnnotationWhereInput[]
    OR?: AnnotationWhereInput[]
    NOT?: AnnotationWhereInput | AnnotationWhereInput[]
    id?: StringFilter<"Annotation"> | string
    productId?: StringFilter<"Annotation"> | string
    imagePath?: StringFilter<"Annotation"> | string
    data?: StringFilter<"Annotation"> | string
    createdAt?: DateTimeFilter<"Annotation"> | Date | string
    updatedAt?: DateTimeFilter<"Annotation"> | Date | string
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }

  export type AnnotationOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    imagePath?: SortOrder
    data?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    product?: ProductOrderByWithRelationInput
  }

  export type AnnotationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AnnotationWhereInput | AnnotationWhereInput[]
    OR?: AnnotationWhereInput[]
    NOT?: AnnotationWhereInput | AnnotationWhereInput[]
    productId?: StringFilter<"Annotation"> | string
    imagePath?: StringFilter<"Annotation"> | string
    data?: StringFilter<"Annotation"> | string
    createdAt?: DateTimeFilter<"Annotation"> | Date | string
    updatedAt?: DateTimeFilter<"Annotation"> | Date | string
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }, "id">

  export type AnnotationOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    imagePath?: SortOrder
    data?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AnnotationCountOrderByAggregateInput
    _max?: AnnotationMaxOrderByAggregateInput
    _min?: AnnotationMinOrderByAggregateInput
  }

  export type AnnotationScalarWhereWithAggregatesInput = {
    AND?: AnnotationScalarWhereWithAggregatesInput | AnnotationScalarWhereWithAggregatesInput[]
    OR?: AnnotationScalarWhereWithAggregatesInput[]
    NOT?: AnnotationScalarWhereWithAggregatesInput | AnnotationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Annotation"> | string
    productId?: StringWithAggregatesFilter<"Annotation"> | string
    imagePath?: StringWithAggregatesFilter<"Annotation"> | string
    data?: StringWithAggregatesFilter<"Annotation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Annotation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Annotation"> | Date | string
  }

  export type DatasetVersionWhereInput = {
    AND?: DatasetVersionWhereInput | DatasetVersionWhereInput[]
    OR?: DatasetVersionWhereInput[]
    NOT?: DatasetVersionWhereInput | DatasetVersionWhereInput[]
    id?: StringFilter<"DatasetVersion"> | string
    productId?: StringFilter<"DatasetVersion"> | string
    displayName?: StringFilter<"DatasetVersion"> | string
    versionName?: StringFilter<"DatasetVersion"> | string
    moduleName?: StringFilter<"DatasetVersion"> | string
    savePath?: StringFilter<"DatasetVersion"> | string
    imageCount?: IntFilter<"DatasetVersion"> | number
    config?: StringFilter<"DatasetVersion"> | string
    createdAt?: DateTimeFilter<"DatasetVersion"> | Date | string
  }

  export type DatasetVersionOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    displayName?: SortOrder
    versionName?: SortOrder
    moduleName?: SortOrder
    savePath?: SortOrder
    imageCount?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
  }

  export type DatasetVersionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DatasetVersionWhereInput | DatasetVersionWhereInput[]
    OR?: DatasetVersionWhereInput[]
    NOT?: DatasetVersionWhereInput | DatasetVersionWhereInput[]
    productId?: StringFilter<"DatasetVersion"> | string
    displayName?: StringFilter<"DatasetVersion"> | string
    versionName?: StringFilter<"DatasetVersion"> | string
    moduleName?: StringFilter<"DatasetVersion"> | string
    savePath?: StringFilter<"DatasetVersion"> | string
    imageCount?: IntFilter<"DatasetVersion"> | number
    config?: StringFilter<"DatasetVersion"> | string
    createdAt?: DateTimeFilter<"DatasetVersion"> | Date | string
  }, "id">

  export type DatasetVersionOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    displayName?: SortOrder
    versionName?: SortOrder
    moduleName?: SortOrder
    savePath?: SortOrder
    imageCount?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    _count?: DatasetVersionCountOrderByAggregateInput
    _avg?: DatasetVersionAvgOrderByAggregateInput
    _max?: DatasetVersionMaxOrderByAggregateInput
    _min?: DatasetVersionMinOrderByAggregateInput
    _sum?: DatasetVersionSumOrderByAggregateInput
  }

  export type DatasetVersionScalarWhereWithAggregatesInput = {
    AND?: DatasetVersionScalarWhereWithAggregatesInput | DatasetVersionScalarWhereWithAggregatesInput[]
    OR?: DatasetVersionScalarWhereWithAggregatesInput[]
    NOT?: DatasetVersionScalarWhereWithAggregatesInput | DatasetVersionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DatasetVersion"> | string
    productId?: StringWithAggregatesFilter<"DatasetVersion"> | string
    displayName?: StringWithAggregatesFilter<"DatasetVersion"> | string
    versionName?: StringWithAggregatesFilter<"DatasetVersion"> | string
    moduleName?: StringWithAggregatesFilter<"DatasetVersion"> | string
    savePath?: StringWithAggregatesFilter<"DatasetVersion"> | string
    imageCount?: IntWithAggregatesFilter<"DatasetVersion"> | number
    config?: StringWithAggregatesFilter<"DatasetVersion"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DatasetVersion"> | Date | string
  }

  export type CameraWhereInput = {
    AND?: CameraWhereInput | CameraWhereInput[]
    OR?: CameraWhereInput[]
    NOT?: CameraWhereInput | CameraWhereInput[]
    id?: StringFilter<"Camera"> | string
    name?: StringFilter<"Camera"> | string
    ip?: StringFilter<"Camera"> | string
    status?: StringFilter<"Camera"> | string
    config?: StringNullableFilter<"Camera"> | string | null
    isEnabled?: BoolFilter<"Camera"> | boolean
    isNetworkCamera?: BoolFilter<"Camera"> | boolean
    createdAt?: DateTimeFilter<"Camera"> | Date | string
    updatedAt?: DateTimeFilter<"Camera"> | Date | string
  }

  export type CameraOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    ip?: SortOrder
    status?: SortOrder
    config?: SortOrderInput | SortOrder
    isEnabled?: SortOrder
    isNetworkCamera?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CameraWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CameraWhereInput | CameraWhereInput[]
    OR?: CameraWhereInput[]
    NOT?: CameraWhereInput | CameraWhereInput[]
    name?: StringFilter<"Camera"> | string
    ip?: StringFilter<"Camera"> | string
    status?: StringFilter<"Camera"> | string
    config?: StringNullableFilter<"Camera"> | string | null
    isEnabled?: BoolFilter<"Camera"> | boolean
    isNetworkCamera?: BoolFilter<"Camera"> | boolean
    createdAt?: DateTimeFilter<"Camera"> | Date | string
    updatedAt?: DateTimeFilter<"Camera"> | Date | string
  }, "id">

  export type CameraOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    ip?: SortOrder
    status?: SortOrder
    config?: SortOrderInput | SortOrder
    isEnabled?: SortOrder
    isNetworkCamera?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CameraCountOrderByAggregateInput
    _max?: CameraMaxOrderByAggregateInput
    _min?: CameraMinOrderByAggregateInput
  }

  export type CameraScalarWhereWithAggregatesInput = {
    AND?: CameraScalarWhereWithAggregatesInput | CameraScalarWhereWithAggregatesInput[]
    OR?: CameraScalarWhereWithAggregatesInput[]
    NOT?: CameraScalarWhereWithAggregatesInput | CameraScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Camera"> | string
    name?: StringWithAggregatesFilter<"Camera"> | string
    ip?: StringWithAggregatesFilter<"Camera"> | string
    status?: StringWithAggregatesFilter<"Camera"> | string
    config?: StringNullableWithAggregatesFilter<"Camera"> | string | null
    isEnabled?: BoolWithAggregatesFilter<"Camera"> | boolean
    isNetworkCamera?: BoolWithAggregatesFilter<"Camera"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Camera"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Camera"> | Date | string
  }

  export type TrainingRecordWhereInput = {
    AND?: TrainingRecordWhereInput | TrainingRecordWhereInput[]
    OR?: TrainingRecordWhereInput[]
    NOT?: TrainingRecordWhereInput | TrainingRecordWhereInput[]
    id?: StringFilter<"TrainingRecord"> | string
    productId?: StringFilter<"TrainingRecord"> | string
    taskUuid?: StringFilter<"TrainingRecord"> | string
    labelName?: StringFilter<"TrainingRecord"> | string
    modelName?: StringFilter<"TrainingRecord"> | string
    config?: StringFilter<"TrainingRecord"> | string
    status?: StringFilter<"TrainingRecord"> | string
    progress?: FloatFilter<"TrainingRecord"> | number
    totalEpochs?: IntNullableFilter<"TrainingRecord"> | number | null
    currentEpoch?: IntNullableFilter<"TrainingRecord"> | number | null
    batchSize?: IntNullableFilter<"TrainingRecord"> | number | null
    learningRate?: FloatNullableFilter<"TrainingRecord"> | number | null
    latestIter?: IntNullableFilter<"TrainingRecord"> | number | null
    metrics?: StringFilter<"TrainingRecord"> | string
    logs?: StringFilter<"TrainingRecord"> | string
    startTime?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    endTime?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    hasBestModel?: BoolFilter<"TrainingRecord"> | boolean
    outputPath?: StringNullableFilter<"TrainingRecord"> | string | null
    createdAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    isRetrain?: BoolFilter<"TrainingRecord"> | boolean
    baseTaskUuid?: StringNullableFilter<"TrainingRecord"> | string | null
    pathId?: StringNullableFilter<"TrainingRecord"> | string | null
    taskChain?: StringFilter<"TrainingRecord"> | string
    generation?: IntFilter<"TrainingRecord"> | number
    fpCount?: IntFilter<"TrainingRecord"> | number
    fnCount?: IntFilter<"TrainingRecord"> | number
    yoloFpCount?: IntFilter<"TrainingRecord"> | number
    encoderName?: StringNullableFilter<"TrainingRecord"> | string | null
    decoderDepth?: IntNullableFilter<"TrainingRecord"> | number | null
    epochs?: IntNullableFilter<"TrainingRecord"> | number | null
    freezeEncoder?: BoolNullableFilter<"TrainingRecord"> | boolean | null
  }

  export type TrainingRecordOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    taskUuid?: SortOrder
    labelName?: SortOrder
    modelName?: SortOrder
    config?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    totalEpochs?: SortOrderInput | SortOrder
    currentEpoch?: SortOrderInput | SortOrder
    batchSize?: SortOrderInput | SortOrder
    learningRate?: SortOrderInput | SortOrder
    latestIter?: SortOrderInput | SortOrder
    metrics?: SortOrder
    logs?: SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    hasBestModel?: SortOrder
    outputPath?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isRetrain?: SortOrder
    baseTaskUuid?: SortOrderInput | SortOrder
    pathId?: SortOrderInput | SortOrder
    taskChain?: SortOrder
    generation?: SortOrder
    fpCount?: SortOrder
    fnCount?: SortOrder
    yoloFpCount?: SortOrder
    encoderName?: SortOrderInput | SortOrder
    decoderDepth?: SortOrderInput | SortOrder
    epochs?: SortOrderInput | SortOrder
    freezeEncoder?: SortOrderInput | SortOrder
  }

  export type TrainingRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    taskUuid_labelName?: TrainingRecordTaskUuidLabelNameCompoundUniqueInput
    AND?: TrainingRecordWhereInput | TrainingRecordWhereInput[]
    OR?: TrainingRecordWhereInput[]
    NOT?: TrainingRecordWhereInput | TrainingRecordWhereInput[]
    productId?: StringFilter<"TrainingRecord"> | string
    taskUuid?: StringFilter<"TrainingRecord"> | string
    labelName?: StringFilter<"TrainingRecord"> | string
    modelName?: StringFilter<"TrainingRecord"> | string
    config?: StringFilter<"TrainingRecord"> | string
    status?: StringFilter<"TrainingRecord"> | string
    progress?: FloatFilter<"TrainingRecord"> | number
    totalEpochs?: IntNullableFilter<"TrainingRecord"> | number | null
    currentEpoch?: IntNullableFilter<"TrainingRecord"> | number | null
    batchSize?: IntNullableFilter<"TrainingRecord"> | number | null
    learningRate?: FloatNullableFilter<"TrainingRecord"> | number | null
    latestIter?: IntNullableFilter<"TrainingRecord"> | number | null
    metrics?: StringFilter<"TrainingRecord"> | string
    logs?: StringFilter<"TrainingRecord"> | string
    startTime?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    endTime?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    hasBestModel?: BoolFilter<"TrainingRecord"> | boolean
    outputPath?: StringNullableFilter<"TrainingRecord"> | string | null
    createdAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    isRetrain?: BoolFilter<"TrainingRecord"> | boolean
    baseTaskUuid?: StringNullableFilter<"TrainingRecord"> | string | null
    pathId?: StringNullableFilter<"TrainingRecord"> | string | null
    taskChain?: StringFilter<"TrainingRecord"> | string
    generation?: IntFilter<"TrainingRecord"> | number
    fpCount?: IntFilter<"TrainingRecord"> | number
    fnCount?: IntFilter<"TrainingRecord"> | number
    yoloFpCount?: IntFilter<"TrainingRecord"> | number
    encoderName?: StringNullableFilter<"TrainingRecord"> | string | null
    decoderDepth?: IntNullableFilter<"TrainingRecord"> | number | null
    epochs?: IntNullableFilter<"TrainingRecord"> | number | null
    freezeEncoder?: BoolNullableFilter<"TrainingRecord"> | boolean | null
  }, "id" | "taskUuid_labelName">

  export type TrainingRecordOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    taskUuid?: SortOrder
    labelName?: SortOrder
    modelName?: SortOrder
    config?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    totalEpochs?: SortOrderInput | SortOrder
    currentEpoch?: SortOrderInput | SortOrder
    batchSize?: SortOrderInput | SortOrder
    learningRate?: SortOrderInput | SortOrder
    latestIter?: SortOrderInput | SortOrder
    metrics?: SortOrder
    logs?: SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    hasBestModel?: SortOrder
    outputPath?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isRetrain?: SortOrder
    baseTaskUuid?: SortOrderInput | SortOrder
    pathId?: SortOrderInput | SortOrder
    taskChain?: SortOrder
    generation?: SortOrder
    fpCount?: SortOrder
    fnCount?: SortOrder
    yoloFpCount?: SortOrder
    encoderName?: SortOrderInput | SortOrder
    decoderDepth?: SortOrderInput | SortOrder
    epochs?: SortOrderInput | SortOrder
    freezeEncoder?: SortOrderInput | SortOrder
    _count?: TrainingRecordCountOrderByAggregateInput
    _avg?: TrainingRecordAvgOrderByAggregateInput
    _max?: TrainingRecordMaxOrderByAggregateInput
    _min?: TrainingRecordMinOrderByAggregateInput
    _sum?: TrainingRecordSumOrderByAggregateInput
  }

  export type TrainingRecordScalarWhereWithAggregatesInput = {
    AND?: TrainingRecordScalarWhereWithAggregatesInput | TrainingRecordScalarWhereWithAggregatesInput[]
    OR?: TrainingRecordScalarWhereWithAggregatesInput[]
    NOT?: TrainingRecordScalarWhereWithAggregatesInput | TrainingRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrainingRecord"> | string
    productId?: StringWithAggregatesFilter<"TrainingRecord"> | string
    taskUuid?: StringWithAggregatesFilter<"TrainingRecord"> | string
    labelName?: StringWithAggregatesFilter<"TrainingRecord"> | string
    modelName?: StringWithAggregatesFilter<"TrainingRecord"> | string
    config?: StringWithAggregatesFilter<"TrainingRecord"> | string
    status?: StringWithAggregatesFilter<"TrainingRecord"> | string
    progress?: FloatWithAggregatesFilter<"TrainingRecord"> | number
    totalEpochs?: IntNullableWithAggregatesFilter<"TrainingRecord"> | number | null
    currentEpoch?: IntNullableWithAggregatesFilter<"TrainingRecord"> | number | null
    batchSize?: IntNullableWithAggregatesFilter<"TrainingRecord"> | number | null
    learningRate?: FloatNullableWithAggregatesFilter<"TrainingRecord"> | number | null
    latestIter?: IntNullableWithAggregatesFilter<"TrainingRecord"> | number | null
    metrics?: StringWithAggregatesFilter<"TrainingRecord"> | string
    logs?: StringWithAggregatesFilter<"TrainingRecord"> | string
    startTime?: DateTimeNullableWithAggregatesFilter<"TrainingRecord"> | Date | string | null
    endTime?: DateTimeNullableWithAggregatesFilter<"TrainingRecord"> | Date | string | null
    hasBestModel?: BoolWithAggregatesFilter<"TrainingRecord"> | boolean
    outputPath?: StringNullableWithAggregatesFilter<"TrainingRecord"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TrainingRecord"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TrainingRecord"> | Date | string
    isRetrain?: BoolWithAggregatesFilter<"TrainingRecord"> | boolean
    baseTaskUuid?: StringNullableWithAggregatesFilter<"TrainingRecord"> | string | null
    pathId?: StringNullableWithAggregatesFilter<"TrainingRecord"> | string | null
    taskChain?: StringWithAggregatesFilter<"TrainingRecord"> | string
    generation?: IntWithAggregatesFilter<"TrainingRecord"> | number
    fpCount?: IntWithAggregatesFilter<"TrainingRecord"> | number
    fnCount?: IntWithAggregatesFilter<"TrainingRecord"> | number
    yoloFpCount?: IntWithAggregatesFilter<"TrainingRecord"> | number
    encoderName?: StringNullableWithAggregatesFilter<"TrainingRecord"> | string | null
    decoderDepth?: IntNullableWithAggregatesFilter<"TrainingRecord"> | number | null
    epochs?: IntNullableWithAggregatesFilter<"TrainingRecord"> | number | null
    freezeEncoder?: BoolNullableWithAggregatesFilter<"TrainingRecord"> | boolean | null
  }

  export type AppSettingsWhereInput = {
    AND?: AppSettingsWhereInput | AppSettingsWhereInput[]
    OR?: AppSettingsWhereInput[]
    NOT?: AppSettingsWhereInput | AppSettingsWhereInput[]
    id?: IntFilter<"AppSettings"> | number
    dataPath?: StringFilter<"AppSettings"> | string
    locale?: StringFilter<"AppSettings"> | string
    backendMode?: StringFilter<"AppSettings"> | string
    backendIp?: StringFilter<"AppSettings"> | string
    backendUrl?: StringFilter<"AppSettings"> | string
    backendPort?: StringFilter<"AppSettings"> | string
    imageSettings?: StringNullableFilter<"AppSettings"> | string | null
    modbusSettings?: StringNullableFilter<"AppSettings"> | string | null
    createdAt?: DateTimeFilter<"AppSettings"> | Date | string
    updatedAt?: DateTimeFilter<"AppSettings"> | Date | string
  }

  export type AppSettingsOrderByWithRelationInput = {
    id?: SortOrder
    dataPath?: SortOrder
    locale?: SortOrder
    backendMode?: SortOrder
    backendIp?: SortOrder
    backendUrl?: SortOrder
    backendPort?: SortOrder
    imageSettings?: SortOrderInput | SortOrder
    modbusSettings?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AppSettingsWhereInput | AppSettingsWhereInput[]
    OR?: AppSettingsWhereInput[]
    NOT?: AppSettingsWhereInput | AppSettingsWhereInput[]
    dataPath?: StringFilter<"AppSettings"> | string
    locale?: StringFilter<"AppSettings"> | string
    backendMode?: StringFilter<"AppSettings"> | string
    backendIp?: StringFilter<"AppSettings"> | string
    backendUrl?: StringFilter<"AppSettings"> | string
    backendPort?: StringFilter<"AppSettings"> | string
    imageSettings?: StringNullableFilter<"AppSettings"> | string | null
    modbusSettings?: StringNullableFilter<"AppSettings"> | string | null
    createdAt?: DateTimeFilter<"AppSettings"> | Date | string
    updatedAt?: DateTimeFilter<"AppSettings"> | Date | string
  }, "id">

  export type AppSettingsOrderByWithAggregationInput = {
    id?: SortOrder
    dataPath?: SortOrder
    locale?: SortOrder
    backendMode?: SortOrder
    backendIp?: SortOrder
    backendUrl?: SortOrder
    backendPort?: SortOrder
    imageSettings?: SortOrderInput | SortOrder
    modbusSettings?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AppSettingsCountOrderByAggregateInput
    _avg?: AppSettingsAvgOrderByAggregateInput
    _max?: AppSettingsMaxOrderByAggregateInput
    _min?: AppSettingsMinOrderByAggregateInput
    _sum?: AppSettingsSumOrderByAggregateInput
  }

  export type AppSettingsScalarWhereWithAggregatesInput = {
    AND?: AppSettingsScalarWhereWithAggregatesInput | AppSettingsScalarWhereWithAggregatesInput[]
    OR?: AppSettingsScalarWhereWithAggregatesInput[]
    NOT?: AppSettingsScalarWhereWithAggregatesInput | AppSettingsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AppSettings"> | number
    dataPath?: StringWithAggregatesFilter<"AppSettings"> | string
    locale?: StringWithAggregatesFilter<"AppSettings"> | string
    backendMode?: StringWithAggregatesFilter<"AppSettings"> | string
    backendIp?: StringWithAggregatesFilter<"AppSettings"> | string
    backendUrl?: StringWithAggregatesFilter<"AppSettings"> | string
    backendPort?: StringWithAggregatesFilter<"AppSettings"> | string
    imageSettings?: StringNullableWithAggregatesFilter<"AppSettings"> | string | null
    modbusSettings?: StringNullableWithAggregatesFilter<"AppSettings"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AppSettings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AppSettings"> | Date | string
  }

  export type RoiImageWhereInput = {
    AND?: RoiImageWhereInput | RoiImageWhereInput[]
    OR?: RoiImageWhereInput[]
    NOT?: RoiImageWhereInput | RoiImageWhereInput[]
    id?: StringFilter<"RoiImage"> | string
    productId?: StringFilter<"RoiImage"> | string
    sourceTaskUuid?: StringFilter<"RoiImage"> | string
    category?: StringFilter<"RoiImage"> | string
    modelIsAnomaly?: BoolFilter<"RoiImage"> | boolean
    userIsAnomaly?: BoolFilter<"RoiImage"> | boolean
    isYoloAnomaly?: BoolFilter<"RoiImage"> | boolean
    dinomalyScore?: FloatNullableFilter<"RoiImage"> | number | null
    roiType?: StringFilter<"RoiImage"> | string
    filePath?: StringFilter<"RoiImage"> | string
    fileName?: StringFilter<"RoiImage"> | string
    thumbnailPath?: StringNullableFilter<"RoiImage"> | string | null
    usedInRetrain?: BoolFilter<"RoiImage"> | boolean
    usedTaskUuid?: StringNullableFilter<"RoiImage"> | string | null
    usedAt?: DateTimeNullableFilter<"RoiImage"> | Date | string | null
    posId?: StringNullableFilter<"RoiImage"> | string | null
    generation?: IntFilter<"RoiImage"> | number
    createdAt?: DateTimeFilter<"RoiImage"> | Date | string
    updatedAt?: DateTimeFilter<"RoiImage"> | Date | string
  }

  export type RoiImageOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    sourceTaskUuid?: SortOrder
    category?: SortOrder
    modelIsAnomaly?: SortOrder
    userIsAnomaly?: SortOrder
    isYoloAnomaly?: SortOrder
    dinomalyScore?: SortOrderInput | SortOrder
    roiType?: SortOrder
    filePath?: SortOrder
    fileName?: SortOrder
    thumbnailPath?: SortOrderInput | SortOrder
    usedInRetrain?: SortOrder
    usedTaskUuid?: SortOrderInput | SortOrder
    usedAt?: SortOrderInput | SortOrder
    posId?: SortOrderInput | SortOrder
    generation?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoiImageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RoiImageWhereInput | RoiImageWhereInput[]
    OR?: RoiImageWhereInput[]
    NOT?: RoiImageWhereInput | RoiImageWhereInput[]
    productId?: StringFilter<"RoiImage"> | string
    sourceTaskUuid?: StringFilter<"RoiImage"> | string
    category?: StringFilter<"RoiImage"> | string
    modelIsAnomaly?: BoolFilter<"RoiImage"> | boolean
    userIsAnomaly?: BoolFilter<"RoiImage"> | boolean
    isYoloAnomaly?: BoolFilter<"RoiImage"> | boolean
    dinomalyScore?: FloatNullableFilter<"RoiImage"> | number | null
    roiType?: StringFilter<"RoiImage"> | string
    filePath?: StringFilter<"RoiImage"> | string
    fileName?: StringFilter<"RoiImage"> | string
    thumbnailPath?: StringNullableFilter<"RoiImage"> | string | null
    usedInRetrain?: BoolFilter<"RoiImage"> | boolean
    usedTaskUuid?: StringNullableFilter<"RoiImage"> | string | null
    usedAt?: DateTimeNullableFilter<"RoiImage"> | Date | string | null
    posId?: StringNullableFilter<"RoiImage"> | string | null
    generation?: IntFilter<"RoiImage"> | number
    createdAt?: DateTimeFilter<"RoiImage"> | Date | string
    updatedAt?: DateTimeFilter<"RoiImage"> | Date | string
  }, "id">

  export type RoiImageOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    sourceTaskUuid?: SortOrder
    category?: SortOrder
    modelIsAnomaly?: SortOrder
    userIsAnomaly?: SortOrder
    isYoloAnomaly?: SortOrder
    dinomalyScore?: SortOrderInput | SortOrder
    roiType?: SortOrder
    filePath?: SortOrder
    fileName?: SortOrder
    thumbnailPath?: SortOrderInput | SortOrder
    usedInRetrain?: SortOrder
    usedTaskUuid?: SortOrderInput | SortOrder
    usedAt?: SortOrderInput | SortOrder
    posId?: SortOrderInput | SortOrder
    generation?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RoiImageCountOrderByAggregateInput
    _avg?: RoiImageAvgOrderByAggregateInput
    _max?: RoiImageMaxOrderByAggregateInput
    _min?: RoiImageMinOrderByAggregateInput
    _sum?: RoiImageSumOrderByAggregateInput
  }

  export type RoiImageScalarWhereWithAggregatesInput = {
    AND?: RoiImageScalarWhereWithAggregatesInput | RoiImageScalarWhereWithAggregatesInput[]
    OR?: RoiImageScalarWhereWithAggregatesInput[]
    NOT?: RoiImageScalarWhereWithAggregatesInput | RoiImageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RoiImage"> | string
    productId?: StringWithAggregatesFilter<"RoiImage"> | string
    sourceTaskUuid?: StringWithAggregatesFilter<"RoiImage"> | string
    category?: StringWithAggregatesFilter<"RoiImage"> | string
    modelIsAnomaly?: BoolWithAggregatesFilter<"RoiImage"> | boolean
    userIsAnomaly?: BoolWithAggregatesFilter<"RoiImage"> | boolean
    isYoloAnomaly?: BoolWithAggregatesFilter<"RoiImage"> | boolean
    dinomalyScore?: FloatNullableWithAggregatesFilter<"RoiImage"> | number | null
    roiType?: StringWithAggregatesFilter<"RoiImage"> | string
    filePath?: StringWithAggregatesFilter<"RoiImage"> | string
    fileName?: StringWithAggregatesFilter<"RoiImage"> | string
    thumbnailPath?: StringNullableWithAggregatesFilter<"RoiImage"> | string | null
    usedInRetrain?: BoolWithAggregatesFilter<"RoiImage"> | boolean
    usedTaskUuid?: StringNullableWithAggregatesFilter<"RoiImage"> | string | null
    usedAt?: DateTimeNullableWithAggregatesFilter<"RoiImage"> | Date | string | null
    posId?: StringNullableWithAggregatesFilter<"RoiImage"> | string | null
    generation?: IntWithAggregatesFilter<"RoiImage"> | number
    createdAt?: DateTimeWithAggregatesFilter<"RoiImage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RoiImage"> | Date | string
  }

  export type ProductCreateInput = {
    id?: string
    name: string
    model: string
    lastImagePath?: string | null
    cameraId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    scheme?: AnnotationSchemeCreateNestedOneWithoutProductsInput
    annotations?: AnnotationCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateInput = {
    id?: string
    name: string
    model: string
    lastImagePath?: string | null
    cameraId?: string | null
    schemeId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    annotations?: AnnotationUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheme?: AnnotationSchemeUpdateOneWithoutProductsNestedInput
    annotations?: AnnotationUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    schemeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    annotations?: AnnotationUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id?: string
    name: string
    model: string
    lastImagePath?: string | null
    cameraId?: string | null
    schemeId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    schemeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationSchemeCreateInput = {
    id?: string
    name: string
    config: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutSchemeInput
  }

  export type AnnotationSchemeUncheckedCreateInput = {
    id?: string
    name: string
    config: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutSchemeInput
  }

  export type AnnotationSchemeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutSchemeNestedInput
  }

  export type AnnotationSchemeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutSchemeNestedInput
  }

  export type AnnotationSchemeCreateManyInput = {
    id?: string
    name: string
    config: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnnotationSchemeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationSchemeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationCreateInput = {
    id?: string
    imagePath: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
    product: ProductCreateNestedOneWithoutAnnotationsInput
  }

  export type AnnotationUncheckedCreateInput = {
    id?: string
    productId: string
    imagePath: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnnotationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutAnnotationsNestedInput
  }

  export type AnnotationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationCreateManyInput = {
    id?: string
    productId: string
    imagePath: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnnotationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatasetVersionCreateInput = {
    id?: string
    productId: string
    displayName?: string
    versionName: string
    moduleName?: string
    savePath: string
    imageCount: number
    config: string
    createdAt?: Date | string
  }

  export type DatasetVersionUncheckedCreateInput = {
    id?: string
    productId: string
    displayName?: string
    versionName: string
    moduleName?: string
    savePath: string
    imageCount: number
    config: string
    createdAt?: Date | string
  }

  export type DatasetVersionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    versionName?: StringFieldUpdateOperationsInput | string
    moduleName?: StringFieldUpdateOperationsInput | string
    savePath?: StringFieldUpdateOperationsInput | string
    imageCount?: IntFieldUpdateOperationsInput | number
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatasetVersionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    versionName?: StringFieldUpdateOperationsInput | string
    moduleName?: StringFieldUpdateOperationsInput | string
    savePath?: StringFieldUpdateOperationsInput | string
    imageCount?: IntFieldUpdateOperationsInput | number
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatasetVersionCreateManyInput = {
    id?: string
    productId: string
    displayName?: string
    versionName: string
    moduleName?: string
    savePath: string
    imageCount: number
    config: string
    createdAt?: Date | string
  }

  export type DatasetVersionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    versionName?: StringFieldUpdateOperationsInput | string
    moduleName?: StringFieldUpdateOperationsInput | string
    savePath?: StringFieldUpdateOperationsInput | string
    imageCount?: IntFieldUpdateOperationsInput | number
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatasetVersionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    versionName?: StringFieldUpdateOperationsInput | string
    moduleName?: StringFieldUpdateOperationsInput | string
    savePath?: StringFieldUpdateOperationsInput | string
    imageCount?: IntFieldUpdateOperationsInput | number
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CameraCreateInput = {
    id?: string
    name: string
    ip: string
    status?: string
    config?: string | null
    isEnabled?: boolean
    isNetworkCamera?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CameraUncheckedCreateInput = {
    id?: string
    name: string
    ip: string
    status?: string
    config?: string | null
    isEnabled?: boolean
    isNetworkCamera?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CameraUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    config?: NullableStringFieldUpdateOperationsInput | string | null
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isNetworkCamera?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CameraUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    config?: NullableStringFieldUpdateOperationsInput | string | null
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isNetworkCamera?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CameraCreateManyInput = {
    id?: string
    name: string
    ip: string
    status?: string
    config?: string | null
    isEnabled?: boolean
    isNetworkCamera?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CameraUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    config?: NullableStringFieldUpdateOperationsInput | string | null
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isNetworkCamera?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CameraUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    config?: NullableStringFieldUpdateOperationsInput | string | null
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isNetworkCamera?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingRecordCreateInput = {
    id?: string
    productId: string
    taskUuid: string
    labelName: string
    modelName: string
    config: string
    status?: string
    progress?: number
    totalEpochs?: number | null
    currentEpoch?: number | null
    batchSize?: number | null
    learningRate?: number | null
    latestIter?: number | null
    metrics?: string
    logs?: string
    startTime?: Date | string | null
    endTime?: Date | string | null
    hasBestModel?: boolean
    outputPath?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isRetrain?: boolean
    baseTaskUuid?: string | null
    pathId?: string | null
    taskChain?: string
    generation?: number
    fpCount?: number
    fnCount?: number
    yoloFpCount?: number
    encoderName?: string | null
    decoderDepth?: number | null
    epochs?: number | null
    freezeEncoder?: boolean | null
  }

  export type TrainingRecordUncheckedCreateInput = {
    id?: string
    productId: string
    taskUuid: string
    labelName: string
    modelName: string
    config: string
    status?: string
    progress?: number
    totalEpochs?: number | null
    currentEpoch?: number | null
    batchSize?: number | null
    learningRate?: number | null
    latestIter?: number | null
    metrics?: string
    logs?: string
    startTime?: Date | string | null
    endTime?: Date | string | null
    hasBestModel?: boolean
    outputPath?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isRetrain?: boolean
    baseTaskUuid?: string | null
    pathId?: string | null
    taskChain?: string
    generation?: number
    fpCount?: number
    fnCount?: number
    yoloFpCount?: number
    encoderName?: string | null
    decoderDepth?: number | null
    epochs?: number | null
    freezeEncoder?: boolean | null
  }

  export type TrainingRecordUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    taskUuid?: StringFieldUpdateOperationsInput | string
    labelName?: StringFieldUpdateOperationsInput | string
    modelName?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: FloatFieldUpdateOperationsInput | number
    totalEpochs?: NullableIntFieldUpdateOperationsInput | number | null
    currentEpoch?: NullableIntFieldUpdateOperationsInput | number | null
    batchSize?: NullableIntFieldUpdateOperationsInput | number | null
    learningRate?: NullableFloatFieldUpdateOperationsInput | number | null
    latestIter?: NullableIntFieldUpdateOperationsInput | number | null
    metrics?: StringFieldUpdateOperationsInput | string
    logs?: StringFieldUpdateOperationsInput | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hasBestModel?: BoolFieldUpdateOperationsInput | boolean
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isRetrain?: BoolFieldUpdateOperationsInput | boolean
    baseTaskUuid?: NullableStringFieldUpdateOperationsInput | string | null
    pathId?: NullableStringFieldUpdateOperationsInput | string | null
    taskChain?: StringFieldUpdateOperationsInput | string
    generation?: IntFieldUpdateOperationsInput | number
    fpCount?: IntFieldUpdateOperationsInput | number
    fnCount?: IntFieldUpdateOperationsInput | number
    yoloFpCount?: IntFieldUpdateOperationsInput | number
    encoderName?: NullableStringFieldUpdateOperationsInput | string | null
    decoderDepth?: NullableIntFieldUpdateOperationsInput | number | null
    epochs?: NullableIntFieldUpdateOperationsInput | number | null
    freezeEncoder?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type TrainingRecordUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    taskUuid?: StringFieldUpdateOperationsInput | string
    labelName?: StringFieldUpdateOperationsInput | string
    modelName?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: FloatFieldUpdateOperationsInput | number
    totalEpochs?: NullableIntFieldUpdateOperationsInput | number | null
    currentEpoch?: NullableIntFieldUpdateOperationsInput | number | null
    batchSize?: NullableIntFieldUpdateOperationsInput | number | null
    learningRate?: NullableFloatFieldUpdateOperationsInput | number | null
    latestIter?: NullableIntFieldUpdateOperationsInput | number | null
    metrics?: StringFieldUpdateOperationsInput | string
    logs?: StringFieldUpdateOperationsInput | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hasBestModel?: BoolFieldUpdateOperationsInput | boolean
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isRetrain?: BoolFieldUpdateOperationsInput | boolean
    baseTaskUuid?: NullableStringFieldUpdateOperationsInput | string | null
    pathId?: NullableStringFieldUpdateOperationsInput | string | null
    taskChain?: StringFieldUpdateOperationsInput | string
    generation?: IntFieldUpdateOperationsInput | number
    fpCount?: IntFieldUpdateOperationsInput | number
    fnCount?: IntFieldUpdateOperationsInput | number
    yoloFpCount?: IntFieldUpdateOperationsInput | number
    encoderName?: NullableStringFieldUpdateOperationsInput | string | null
    decoderDepth?: NullableIntFieldUpdateOperationsInput | number | null
    epochs?: NullableIntFieldUpdateOperationsInput | number | null
    freezeEncoder?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type TrainingRecordCreateManyInput = {
    id?: string
    productId: string
    taskUuid: string
    labelName: string
    modelName: string
    config: string
    status?: string
    progress?: number
    totalEpochs?: number | null
    currentEpoch?: number | null
    batchSize?: number | null
    learningRate?: number | null
    latestIter?: number | null
    metrics?: string
    logs?: string
    startTime?: Date | string | null
    endTime?: Date | string | null
    hasBestModel?: boolean
    outputPath?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isRetrain?: boolean
    baseTaskUuid?: string | null
    pathId?: string | null
    taskChain?: string
    generation?: number
    fpCount?: number
    fnCount?: number
    yoloFpCount?: number
    encoderName?: string | null
    decoderDepth?: number | null
    epochs?: number | null
    freezeEncoder?: boolean | null
  }

  export type TrainingRecordUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    taskUuid?: StringFieldUpdateOperationsInput | string
    labelName?: StringFieldUpdateOperationsInput | string
    modelName?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: FloatFieldUpdateOperationsInput | number
    totalEpochs?: NullableIntFieldUpdateOperationsInput | number | null
    currentEpoch?: NullableIntFieldUpdateOperationsInput | number | null
    batchSize?: NullableIntFieldUpdateOperationsInput | number | null
    learningRate?: NullableFloatFieldUpdateOperationsInput | number | null
    latestIter?: NullableIntFieldUpdateOperationsInput | number | null
    metrics?: StringFieldUpdateOperationsInput | string
    logs?: StringFieldUpdateOperationsInput | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hasBestModel?: BoolFieldUpdateOperationsInput | boolean
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isRetrain?: BoolFieldUpdateOperationsInput | boolean
    baseTaskUuid?: NullableStringFieldUpdateOperationsInput | string | null
    pathId?: NullableStringFieldUpdateOperationsInput | string | null
    taskChain?: StringFieldUpdateOperationsInput | string
    generation?: IntFieldUpdateOperationsInput | number
    fpCount?: IntFieldUpdateOperationsInput | number
    fnCount?: IntFieldUpdateOperationsInput | number
    yoloFpCount?: IntFieldUpdateOperationsInput | number
    encoderName?: NullableStringFieldUpdateOperationsInput | string | null
    decoderDepth?: NullableIntFieldUpdateOperationsInput | number | null
    epochs?: NullableIntFieldUpdateOperationsInput | number | null
    freezeEncoder?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type TrainingRecordUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    taskUuid?: StringFieldUpdateOperationsInput | string
    labelName?: StringFieldUpdateOperationsInput | string
    modelName?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: FloatFieldUpdateOperationsInput | number
    totalEpochs?: NullableIntFieldUpdateOperationsInput | number | null
    currentEpoch?: NullableIntFieldUpdateOperationsInput | number | null
    batchSize?: NullableIntFieldUpdateOperationsInput | number | null
    learningRate?: NullableFloatFieldUpdateOperationsInput | number | null
    latestIter?: NullableIntFieldUpdateOperationsInput | number | null
    metrics?: StringFieldUpdateOperationsInput | string
    logs?: StringFieldUpdateOperationsInput | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hasBestModel?: BoolFieldUpdateOperationsInput | boolean
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isRetrain?: BoolFieldUpdateOperationsInput | boolean
    baseTaskUuid?: NullableStringFieldUpdateOperationsInput | string | null
    pathId?: NullableStringFieldUpdateOperationsInput | string | null
    taskChain?: StringFieldUpdateOperationsInput | string
    generation?: IntFieldUpdateOperationsInput | number
    fpCount?: IntFieldUpdateOperationsInput | number
    fnCount?: IntFieldUpdateOperationsInput | number
    yoloFpCount?: IntFieldUpdateOperationsInput | number
    encoderName?: NullableStringFieldUpdateOperationsInput | string | null
    decoderDepth?: NullableIntFieldUpdateOperationsInput | number | null
    epochs?: NullableIntFieldUpdateOperationsInput | number | null
    freezeEncoder?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type AppSettingsCreateInput = {
    id?: number
    dataPath: string
    locale?: string
    backendMode?: string
    backendIp?: string
    backendUrl?: string
    backendPort?: string
    imageSettings?: string | null
    modbusSettings?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppSettingsUncheckedCreateInput = {
    id?: number
    dataPath: string
    locale?: string
    backendMode?: string
    backendIp?: string
    backendUrl?: string
    backendPort?: string
    imageSettings?: string | null
    modbusSettings?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppSettingsUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    dataPath?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    backendMode?: StringFieldUpdateOperationsInput | string
    backendIp?: StringFieldUpdateOperationsInput | string
    backendUrl?: StringFieldUpdateOperationsInput | string
    backendPort?: StringFieldUpdateOperationsInput | string
    imageSettings?: NullableStringFieldUpdateOperationsInput | string | null
    modbusSettings?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    dataPath?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    backendMode?: StringFieldUpdateOperationsInput | string
    backendIp?: StringFieldUpdateOperationsInput | string
    backendUrl?: StringFieldUpdateOperationsInput | string
    backendPort?: StringFieldUpdateOperationsInput | string
    imageSettings?: NullableStringFieldUpdateOperationsInput | string | null
    modbusSettings?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingsCreateManyInput = {
    id?: number
    dataPath: string
    locale?: string
    backendMode?: string
    backendIp?: string
    backendUrl?: string
    backendPort?: string
    imageSettings?: string | null
    modbusSettings?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppSettingsUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    dataPath?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    backendMode?: StringFieldUpdateOperationsInput | string
    backendIp?: StringFieldUpdateOperationsInput | string
    backendUrl?: StringFieldUpdateOperationsInput | string
    backendPort?: StringFieldUpdateOperationsInput | string
    imageSettings?: NullableStringFieldUpdateOperationsInput | string | null
    modbusSettings?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    dataPath?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    backendMode?: StringFieldUpdateOperationsInput | string
    backendIp?: StringFieldUpdateOperationsInput | string
    backendUrl?: StringFieldUpdateOperationsInput | string
    backendPort?: StringFieldUpdateOperationsInput | string
    imageSettings?: NullableStringFieldUpdateOperationsInput | string | null
    modbusSettings?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoiImageCreateInput = {
    id?: string
    productId: string
    sourceTaskUuid: string
    category: string
    modelIsAnomaly: boolean
    userIsAnomaly: boolean
    isYoloAnomaly?: boolean
    dinomalyScore?: number | null
    roiType?: string
    filePath: string
    fileName: string
    thumbnailPath?: string | null
    usedInRetrain?: boolean
    usedTaskUuid?: string | null
    usedAt?: Date | string | null
    posId?: string | null
    generation?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RoiImageUncheckedCreateInput = {
    id?: string
    productId: string
    sourceTaskUuid: string
    category: string
    modelIsAnomaly: boolean
    userIsAnomaly: boolean
    isYoloAnomaly?: boolean
    dinomalyScore?: number | null
    roiType?: string
    filePath: string
    fileName: string
    thumbnailPath?: string | null
    usedInRetrain?: boolean
    usedTaskUuid?: string | null
    usedAt?: Date | string | null
    posId?: string | null
    generation?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RoiImageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sourceTaskUuid?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    modelIsAnomaly?: BoolFieldUpdateOperationsInput | boolean
    userIsAnomaly?: BoolFieldUpdateOperationsInput | boolean
    isYoloAnomaly?: BoolFieldUpdateOperationsInput | boolean
    dinomalyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    roiType?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    usedInRetrain?: BoolFieldUpdateOperationsInput | boolean
    usedTaskUuid?: NullableStringFieldUpdateOperationsInput | string | null
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    posId?: NullableStringFieldUpdateOperationsInput | string | null
    generation?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoiImageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sourceTaskUuid?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    modelIsAnomaly?: BoolFieldUpdateOperationsInput | boolean
    userIsAnomaly?: BoolFieldUpdateOperationsInput | boolean
    isYoloAnomaly?: BoolFieldUpdateOperationsInput | boolean
    dinomalyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    roiType?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    usedInRetrain?: BoolFieldUpdateOperationsInput | boolean
    usedTaskUuid?: NullableStringFieldUpdateOperationsInput | string | null
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    posId?: NullableStringFieldUpdateOperationsInput | string | null
    generation?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoiImageCreateManyInput = {
    id?: string
    productId: string
    sourceTaskUuid: string
    category: string
    modelIsAnomaly: boolean
    userIsAnomaly: boolean
    isYoloAnomaly?: boolean
    dinomalyScore?: number | null
    roiType?: string
    filePath: string
    fileName: string
    thumbnailPath?: string | null
    usedInRetrain?: boolean
    usedTaskUuid?: string | null
    usedAt?: Date | string | null
    posId?: string | null
    generation?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RoiImageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sourceTaskUuid?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    modelIsAnomaly?: BoolFieldUpdateOperationsInput | boolean
    userIsAnomaly?: BoolFieldUpdateOperationsInput | boolean
    isYoloAnomaly?: BoolFieldUpdateOperationsInput | boolean
    dinomalyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    roiType?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    usedInRetrain?: BoolFieldUpdateOperationsInput | boolean
    usedTaskUuid?: NullableStringFieldUpdateOperationsInput | string | null
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    posId?: NullableStringFieldUpdateOperationsInput | string | null
    generation?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoiImageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sourceTaskUuid?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    modelIsAnomaly?: BoolFieldUpdateOperationsInput | boolean
    userIsAnomaly?: BoolFieldUpdateOperationsInput | boolean
    isYoloAnomaly?: BoolFieldUpdateOperationsInput | boolean
    dinomalyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    roiType?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    usedInRetrain?: BoolFieldUpdateOperationsInput | boolean
    usedTaskUuid?: NullableStringFieldUpdateOperationsInput | string | null
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    posId?: NullableStringFieldUpdateOperationsInput | string | null
    generation?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AnnotationSchemeNullableScalarRelationFilter = {
    is?: AnnotationSchemeWhereInput | null
    isNot?: AnnotationSchemeWhereInput | null
  }

  export type AnnotationListRelationFilter = {
    every?: AnnotationWhereInput
    some?: AnnotationWhereInput
    none?: AnnotationWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AnnotationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    model?: SortOrder
    lastImagePath?: SortOrder
    cameraId?: SortOrder
    schemeId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    model?: SortOrder
    lastImagePath?: SortOrder
    cameraId?: SortOrder
    schemeId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    model?: SortOrder
    lastImagePath?: SortOrder
    cameraId?: SortOrder
    schemeId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AnnotationSchemeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnnotationSchemeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnnotationSchemeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductScalarRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type AnnotationCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    imagePath?: SortOrder
    data?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnnotationMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    imagePath?: SortOrder
    data?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnnotationMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    imagePath?: SortOrder
    data?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DatasetVersionCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    displayName?: SortOrder
    versionName?: SortOrder
    moduleName?: SortOrder
    savePath?: SortOrder
    imageCount?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
  }

  export type DatasetVersionAvgOrderByAggregateInput = {
    imageCount?: SortOrder
  }

  export type DatasetVersionMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    displayName?: SortOrder
    versionName?: SortOrder
    moduleName?: SortOrder
    savePath?: SortOrder
    imageCount?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
  }

  export type DatasetVersionMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    displayName?: SortOrder
    versionName?: SortOrder
    moduleName?: SortOrder
    savePath?: SortOrder
    imageCount?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
  }

  export type DatasetVersionSumOrderByAggregateInput = {
    imageCount?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type CameraCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    ip?: SortOrder
    status?: SortOrder
    config?: SortOrder
    isEnabled?: SortOrder
    isNetworkCamera?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CameraMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    ip?: SortOrder
    status?: SortOrder
    config?: SortOrder
    isEnabled?: SortOrder
    isNetworkCamera?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CameraMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    ip?: SortOrder
    status?: SortOrder
    config?: SortOrder
    isEnabled?: SortOrder
    isNetworkCamera?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type TrainingRecordTaskUuidLabelNameCompoundUniqueInput = {
    taskUuid: string
    labelName: string
  }

  export type TrainingRecordCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    taskUuid?: SortOrder
    labelName?: SortOrder
    modelName?: SortOrder
    config?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    totalEpochs?: SortOrder
    currentEpoch?: SortOrder
    batchSize?: SortOrder
    learningRate?: SortOrder
    latestIter?: SortOrder
    metrics?: SortOrder
    logs?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    hasBestModel?: SortOrder
    outputPath?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isRetrain?: SortOrder
    baseTaskUuid?: SortOrder
    pathId?: SortOrder
    taskChain?: SortOrder
    generation?: SortOrder
    fpCount?: SortOrder
    fnCount?: SortOrder
    yoloFpCount?: SortOrder
    encoderName?: SortOrder
    decoderDepth?: SortOrder
    epochs?: SortOrder
    freezeEncoder?: SortOrder
  }

  export type TrainingRecordAvgOrderByAggregateInput = {
    progress?: SortOrder
    totalEpochs?: SortOrder
    currentEpoch?: SortOrder
    batchSize?: SortOrder
    learningRate?: SortOrder
    latestIter?: SortOrder
    generation?: SortOrder
    fpCount?: SortOrder
    fnCount?: SortOrder
    yoloFpCount?: SortOrder
    decoderDepth?: SortOrder
    epochs?: SortOrder
  }

  export type TrainingRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    taskUuid?: SortOrder
    labelName?: SortOrder
    modelName?: SortOrder
    config?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    totalEpochs?: SortOrder
    currentEpoch?: SortOrder
    batchSize?: SortOrder
    learningRate?: SortOrder
    latestIter?: SortOrder
    metrics?: SortOrder
    logs?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    hasBestModel?: SortOrder
    outputPath?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isRetrain?: SortOrder
    baseTaskUuid?: SortOrder
    pathId?: SortOrder
    taskChain?: SortOrder
    generation?: SortOrder
    fpCount?: SortOrder
    fnCount?: SortOrder
    yoloFpCount?: SortOrder
    encoderName?: SortOrder
    decoderDepth?: SortOrder
    epochs?: SortOrder
    freezeEncoder?: SortOrder
  }

  export type TrainingRecordMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    taskUuid?: SortOrder
    labelName?: SortOrder
    modelName?: SortOrder
    config?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    totalEpochs?: SortOrder
    currentEpoch?: SortOrder
    batchSize?: SortOrder
    learningRate?: SortOrder
    latestIter?: SortOrder
    metrics?: SortOrder
    logs?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    hasBestModel?: SortOrder
    outputPath?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isRetrain?: SortOrder
    baseTaskUuid?: SortOrder
    pathId?: SortOrder
    taskChain?: SortOrder
    generation?: SortOrder
    fpCount?: SortOrder
    fnCount?: SortOrder
    yoloFpCount?: SortOrder
    encoderName?: SortOrder
    decoderDepth?: SortOrder
    epochs?: SortOrder
    freezeEncoder?: SortOrder
  }

  export type TrainingRecordSumOrderByAggregateInput = {
    progress?: SortOrder
    totalEpochs?: SortOrder
    currentEpoch?: SortOrder
    batchSize?: SortOrder
    learningRate?: SortOrder
    latestIter?: SortOrder
    generation?: SortOrder
    fpCount?: SortOrder
    fnCount?: SortOrder
    yoloFpCount?: SortOrder
    decoderDepth?: SortOrder
    epochs?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type AppSettingsCountOrderByAggregateInput = {
    id?: SortOrder
    dataPath?: SortOrder
    locale?: SortOrder
    backendMode?: SortOrder
    backendIp?: SortOrder
    backendUrl?: SortOrder
    backendPort?: SortOrder
    imageSettings?: SortOrder
    modbusSettings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingsAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AppSettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    dataPath?: SortOrder
    locale?: SortOrder
    backendMode?: SortOrder
    backendIp?: SortOrder
    backendUrl?: SortOrder
    backendPort?: SortOrder
    imageSettings?: SortOrder
    modbusSettings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingsMinOrderByAggregateInput = {
    id?: SortOrder
    dataPath?: SortOrder
    locale?: SortOrder
    backendMode?: SortOrder
    backendIp?: SortOrder
    backendUrl?: SortOrder
    backendPort?: SortOrder
    imageSettings?: SortOrder
    modbusSettings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingsSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RoiImageCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sourceTaskUuid?: SortOrder
    category?: SortOrder
    modelIsAnomaly?: SortOrder
    userIsAnomaly?: SortOrder
    isYoloAnomaly?: SortOrder
    dinomalyScore?: SortOrder
    roiType?: SortOrder
    filePath?: SortOrder
    fileName?: SortOrder
    thumbnailPath?: SortOrder
    usedInRetrain?: SortOrder
    usedTaskUuid?: SortOrder
    usedAt?: SortOrder
    posId?: SortOrder
    generation?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoiImageAvgOrderByAggregateInput = {
    dinomalyScore?: SortOrder
    generation?: SortOrder
  }

  export type RoiImageMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sourceTaskUuid?: SortOrder
    category?: SortOrder
    modelIsAnomaly?: SortOrder
    userIsAnomaly?: SortOrder
    isYoloAnomaly?: SortOrder
    dinomalyScore?: SortOrder
    roiType?: SortOrder
    filePath?: SortOrder
    fileName?: SortOrder
    thumbnailPath?: SortOrder
    usedInRetrain?: SortOrder
    usedTaskUuid?: SortOrder
    usedAt?: SortOrder
    posId?: SortOrder
    generation?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoiImageMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sourceTaskUuid?: SortOrder
    category?: SortOrder
    modelIsAnomaly?: SortOrder
    userIsAnomaly?: SortOrder
    isYoloAnomaly?: SortOrder
    dinomalyScore?: SortOrder
    roiType?: SortOrder
    filePath?: SortOrder
    fileName?: SortOrder
    thumbnailPath?: SortOrder
    usedInRetrain?: SortOrder
    usedTaskUuid?: SortOrder
    usedAt?: SortOrder
    posId?: SortOrder
    generation?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoiImageSumOrderByAggregateInput = {
    dinomalyScore?: SortOrder
    generation?: SortOrder
  }

  export type AnnotationSchemeCreateNestedOneWithoutProductsInput = {
    create?: XOR<AnnotationSchemeCreateWithoutProductsInput, AnnotationSchemeUncheckedCreateWithoutProductsInput>
    connectOrCreate?: AnnotationSchemeCreateOrConnectWithoutProductsInput
    connect?: AnnotationSchemeWhereUniqueInput
  }

  export type AnnotationCreateNestedManyWithoutProductInput = {
    create?: XOR<AnnotationCreateWithoutProductInput, AnnotationUncheckedCreateWithoutProductInput> | AnnotationCreateWithoutProductInput[] | AnnotationUncheckedCreateWithoutProductInput[]
    connectOrCreate?: AnnotationCreateOrConnectWithoutProductInput | AnnotationCreateOrConnectWithoutProductInput[]
    createMany?: AnnotationCreateManyProductInputEnvelope
    connect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
  }

  export type AnnotationUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<AnnotationCreateWithoutProductInput, AnnotationUncheckedCreateWithoutProductInput> | AnnotationCreateWithoutProductInput[] | AnnotationUncheckedCreateWithoutProductInput[]
    connectOrCreate?: AnnotationCreateOrConnectWithoutProductInput | AnnotationCreateOrConnectWithoutProductInput[]
    createMany?: AnnotationCreateManyProductInputEnvelope
    connect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AnnotationSchemeUpdateOneWithoutProductsNestedInput = {
    create?: XOR<AnnotationSchemeCreateWithoutProductsInput, AnnotationSchemeUncheckedCreateWithoutProductsInput>
    connectOrCreate?: AnnotationSchemeCreateOrConnectWithoutProductsInput
    upsert?: AnnotationSchemeUpsertWithoutProductsInput
    disconnect?: AnnotationSchemeWhereInput | boolean
    delete?: AnnotationSchemeWhereInput | boolean
    connect?: AnnotationSchemeWhereUniqueInput
    update?: XOR<XOR<AnnotationSchemeUpdateToOneWithWhereWithoutProductsInput, AnnotationSchemeUpdateWithoutProductsInput>, AnnotationSchemeUncheckedUpdateWithoutProductsInput>
  }

  export type AnnotationUpdateManyWithoutProductNestedInput = {
    create?: XOR<AnnotationCreateWithoutProductInput, AnnotationUncheckedCreateWithoutProductInput> | AnnotationCreateWithoutProductInput[] | AnnotationUncheckedCreateWithoutProductInput[]
    connectOrCreate?: AnnotationCreateOrConnectWithoutProductInput | AnnotationCreateOrConnectWithoutProductInput[]
    upsert?: AnnotationUpsertWithWhereUniqueWithoutProductInput | AnnotationUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: AnnotationCreateManyProductInputEnvelope
    set?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    disconnect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    delete?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    connect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    update?: AnnotationUpdateWithWhereUniqueWithoutProductInput | AnnotationUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: AnnotationUpdateManyWithWhereWithoutProductInput | AnnotationUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: AnnotationScalarWhereInput | AnnotationScalarWhereInput[]
  }

  export type AnnotationUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<AnnotationCreateWithoutProductInput, AnnotationUncheckedCreateWithoutProductInput> | AnnotationCreateWithoutProductInput[] | AnnotationUncheckedCreateWithoutProductInput[]
    connectOrCreate?: AnnotationCreateOrConnectWithoutProductInput | AnnotationCreateOrConnectWithoutProductInput[]
    upsert?: AnnotationUpsertWithWhereUniqueWithoutProductInput | AnnotationUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: AnnotationCreateManyProductInputEnvelope
    set?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    disconnect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    delete?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    connect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    update?: AnnotationUpdateWithWhereUniqueWithoutProductInput | AnnotationUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: AnnotationUpdateManyWithWhereWithoutProductInput | AnnotationUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: AnnotationScalarWhereInput | AnnotationScalarWhereInput[]
  }

  export type ProductCreateNestedManyWithoutSchemeInput = {
    create?: XOR<ProductCreateWithoutSchemeInput, ProductUncheckedCreateWithoutSchemeInput> | ProductCreateWithoutSchemeInput[] | ProductUncheckedCreateWithoutSchemeInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutSchemeInput | ProductCreateOrConnectWithoutSchemeInput[]
    createMany?: ProductCreateManySchemeInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutSchemeInput = {
    create?: XOR<ProductCreateWithoutSchemeInput, ProductUncheckedCreateWithoutSchemeInput> | ProductCreateWithoutSchemeInput[] | ProductUncheckedCreateWithoutSchemeInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutSchemeInput | ProductCreateOrConnectWithoutSchemeInput[]
    createMany?: ProductCreateManySchemeInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type ProductUpdateManyWithoutSchemeNestedInput = {
    create?: XOR<ProductCreateWithoutSchemeInput, ProductUncheckedCreateWithoutSchemeInput> | ProductCreateWithoutSchemeInput[] | ProductUncheckedCreateWithoutSchemeInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutSchemeInput | ProductCreateOrConnectWithoutSchemeInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutSchemeInput | ProductUpsertWithWhereUniqueWithoutSchemeInput[]
    createMany?: ProductCreateManySchemeInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutSchemeInput | ProductUpdateWithWhereUniqueWithoutSchemeInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutSchemeInput | ProductUpdateManyWithWhereWithoutSchemeInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutSchemeNestedInput = {
    create?: XOR<ProductCreateWithoutSchemeInput, ProductUncheckedCreateWithoutSchemeInput> | ProductCreateWithoutSchemeInput[] | ProductUncheckedCreateWithoutSchemeInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutSchemeInput | ProductCreateOrConnectWithoutSchemeInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutSchemeInput | ProductUpsertWithWhereUniqueWithoutSchemeInput[]
    createMany?: ProductCreateManySchemeInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutSchemeInput | ProductUpdateWithWhereUniqueWithoutSchemeInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutSchemeInput | ProductUpdateManyWithWhereWithoutSchemeInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type ProductCreateNestedOneWithoutAnnotationsInput = {
    create?: XOR<ProductCreateWithoutAnnotationsInput, ProductUncheckedCreateWithoutAnnotationsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutAnnotationsInput
    connect?: ProductWhereUniqueInput
  }

  export type ProductUpdateOneRequiredWithoutAnnotationsNestedInput = {
    create?: XOR<ProductCreateWithoutAnnotationsInput, ProductUncheckedCreateWithoutAnnotationsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutAnnotationsInput
    upsert?: ProductUpsertWithoutAnnotationsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutAnnotationsInput, ProductUpdateWithoutAnnotationsInput>, ProductUncheckedUpdateWithoutAnnotationsInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type AnnotationSchemeCreateWithoutProductsInput = {
    id?: string
    name: string
    config: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnnotationSchemeUncheckedCreateWithoutProductsInput = {
    id?: string
    name: string
    config: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnnotationSchemeCreateOrConnectWithoutProductsInput = {
    where: AnnotationSchemeWhereUniqueInput
    create: XOR<AnnotationSchemeCreateWithoutProductsInput, AnnotationSchemeUncheckedCreateWithoutProductsInput>
  }

  export type AnnotationCreateWithoutProductInput = {
    id?: string
    imagePath: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnnotationUncheckedCreateWithoutProductInput = {
    id?: string
    imagePath: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnnotationCreateOrConnectWithoutProductInput = {
    where: AnnotationWhereUniqueInput
    create: XOR<AnnotationCreateWithoutProductInput, AnnotationUncheckedCreateWithoutProductInput>
  }

  export type AnnotationCreateManyProductInputEnvelope = {
    data: AnnotationCreateManyProductInput | AnnotationCreateManyProductInput[]
  }

  export type AnnotationSchemeUpsertWithoutProductsInput = {
    update: XOR<AnnotationSchemeUpdateWithoutProductsInput, AnnotationSchemeUncheckedUpdateWithoutProductsInput>
    create: XOR<AnnotationSchemeCreateWithoutProductsInput, AnnotationSchemeUncheckedCreateWithoutProductsInput>
    where?: AnnotationSchemeWhereInput
  }

  export type AnnotationSchemeUpdateToOneWithWhereWithoutProductsInput = {
    where?: AnnotationSchemeWhereInput
    data: XOR<AnnotationSchemeUpdateWithoutProductsInput, AnnotationSchemeUncheckedUpdateWithoutProductsInput>
  }

  export type AnnotationSchemeUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationSchemeUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationUpsertWithWhereUniqueWithoutProductInput = {
    where: AnnotationWhereUniqueInput
    update: XOR<AnnotationUpdateWithoutProductInput, AnnotationUncheckedUpdateWithoutProductInput>
    create: XOR<AnnotationCreateWithoutProductInput, AnnotationUncheckedCreateWithoutProductInput>
  }

  export type AnnotationUpdateWithWhereUniqueWithoutProductInput = {
    where: AnnotationWhereUniqueInput
    data: XOR<AnnotationUpdateWithoutProductInput, AnnotationUncheckedUpdateWithoutProductInput>
  }

  export type AnnotationUpdateManyWithWhereWithoutProductInput = {
    where: AnnotationScalarWhereInput
    data: XOR<AnnotationUpdateManyMutationInput, AnnotationUncheckedUpdateManyWithoutProductInput>
  }

  export type AnnotationScalarWhereInput = {
    AND?: AnnotationScalarWhereInput | AnnotationScalarWhereInput[]
    OR?: AnnotationScalarWhereInput[]
    NOT?: AnnotationScalarWhereInput | AnnotationScalarWhereInput[]
    id?: StringFilter<"Annotation"> | string
    productId?: StringFilter<"Annotation"> | string
    imagePath?: StringFilter<"Annotation"> | string
    data?: StringFilter<"Annotation"> | string
    createdAt?: DateTimeFilter<"Annotation"> | Date | string
    updatedAt?: DateTimeFilter<"Annotation"> | Date | string
  }

  export type ProductCreateWithoutSchemeInput = {
    id?: string
    name: string
    model: string
    lastImagePath?: string | null
    cameraId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    annotations?: AnnotationCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutSchemeInput = {
    id?: string
    name: string
    model: string
    lastImagePath?: string | null
    cameraId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    annotations?: AnnotationUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutSchemeInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutSchemeInput, ProductUncheckedCreateWithoutSchemeInput>
  }

  export type ProductCreateManySchemeInputEnvelope = {
    data: ProductCreateManySchemeInput | ProductCreateManySchemeInput[]
  }

  export type ProductUpsertWithWhereUniqueWithoutSchemeInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutSchemeInput, ProductUncheckedUpdateWithoutSchemeInput>
    create: XOR<ProductCreateWithoutSchemeInput, ProductUncheckedCreateWithoutSchemeInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutSchemeInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutSchemeInput, ProductUncheckedUpdateWithoutSchemeInput>
  }

  export type ProductUpdateManyWithWhereWithoutSchemeInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutSchemeInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    model?: StringFilter<"Product"> | string
    lastImagePath?: StringNullableFilter<"Product"> | string | null
    cameraId?: StringNullableFilter<"Product"> | string | null
    schemeId?: StringNullableFilter<"Product"> | string | null
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
  }

  export type ProductCreateWithoutAnnotationsInput = {
    id?: string
    name: string
    model: string
    lastImagePath?: string | null
    cameraId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    scheme?: AnnotationSchemeCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutAnnotationsInput = {
    id?: string
    name: string
    model: string
    lastImagePath?: string | null
    cameraId?: string | null
    schemeId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductCreateOrConnectWithoutAnnotationsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutAnnotationsInput, ProductUncheckedCreateWithoutAnnotationsInput>
  }

  export type ProductUpsertWithoutAnnotationsInput = {
    update: XOR<ProductUpdateWithoutAnnotationsInput, ProductUncheckedUpdateWithoutAnnotationsInput>
    create: XOR<ProductCreateWithoutAnnotationsInput, ProductUncheckedCreateWithoutAnnotationsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutAnnotationsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutAnnotationsInput, ProductUncheckedUpdateWithoutAnnotationsInput>
  }

  export type ProductUpdateWithoutAnnotationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheme?: AnnotationSchemeUpdateOneWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutAnnotationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    schemeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationCreateManyProductInput = {
    id?: string
    imagePath: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnnotationUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateManySchemeInput = {
    id?: string
    name: string
    model: string
    lastImagePath?: string | null
    cameraId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateWithoutSchemeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    annotations?: AnnotationUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutSchemeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    annotations?: AnnotationUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutSchemeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    lastImagePath?: NullableStringFieldUpdateOperationsInput | string | null
    cameraId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}