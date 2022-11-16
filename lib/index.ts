import { ClassType, getMetadataStorage, InputType, registerEnumType, ObjectType } from 'type-graphql';
import type { FieldMetadata } from 'type-graphql/dist/metadata/definitions';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

const metadata = getMetadataStorage();

export function buildEnum<T extends ClassType>(
  Class: T,
  name: string,
): Record<keyof InstanceType<T>, keyof InstanceType<T>> {
  const enumObj = {} as Record<keyof InstanceType<T>, keyof InstanceType<T>>;

  metadata.fields.forEach((f) => {
    if (f.target !== Class && !f.target.isPrototypeOf(Class)) return;

    enumObj[f.name as keyof InstanceType<T>] = f.name;
  });

  registerEnumType(enumObj, { name });

  return enumObj;
}

export function buildType(
  BaseClass: ClassType,
  buildFn: (f: FieldMetadata) => FieldMetadata | FieldMetadata[] | undefined,
): any {
  @InputType({ isAbstract: true })
  @ObjectType({ isAbstract: true })
  class ChildClass { }

  metadata.fields.forEach((f) => {
    if (f.target !== BaseClass && !f.target.isPrototypeOf(BaseClass)) return;

    f.getType(); // detect array type options, issue #3

    const field = buildFn(f);

    if (field instanceof Array) {
      field.forEach((field) =>
        metadata.fields.push({ ...field, target: ChildClass })
      );
    } else if (field) {
      metadata.fields.push({ ...field, target: ChildClass })
    }
  });

  return ChildClass;
}

export function Pick<T extends ClassType, K extends keyof InstanceType<T>>(BaseClass: T, names: Record<K, 1>): ClassType<Pick<InstanceType<T>, K>> {
  return buildType(BaseClass, (f) => f.name in names ? f : undefined);
}

export function Omit<T extends ClassType, K extends keyof InstanceType<T>>(BaseClass: T, names: Record<K, 1>): ClassType<Omit<InstanceType<T>, K>> {
  return buildType(BaseClass, (f) => f.name in names ? undefined : f);
}

export function Partial<T extends ClassType, K extends keyof InstanceType<T> = keyof InstanceType<T>>(BaseClass: T, names?: Record<K, 1>): ClassType<PartialBy<InstanceType<T>, K>> {
  return buildType(BaseClass, (f) => !names || f.name in names ? { ...f, typeOptions: { ...f.typeOptions, nullable: true } } : f);
}

export function Required<T extends ClassType, K extends keyof InstanceType<T> = keyof InstanceType<T>>(BaseClass: T, names?: Record<K, 1>): ClassType<RequiredBy<InstanceType<T>, K>> {
  return buildType(BaseClass, (f) => !names || f.name in names ? { ...f, typeOptions: { ...f.typeOptions, nullable: false } } : f);
}
