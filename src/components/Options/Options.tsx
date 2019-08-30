import { FunctionalComponent, h } from '@stencil/core';

interface IOptions {
  items: { [key: string]: string }[];
  prompt?: string;
  selected?: string;
  textAttr?: string;
  valueAttr?: string;
  caseInsensitive?: boolean;
}

const Options: FunctionalComponent<IOptions> = ({
  prompt,
  selected,
  items = [],
  textAttr = 'name',
  valueAttr = null,
  caseInsensitive = false
}) => {
  const stringComparisonConfig = caseInsensitive
    ? { sensitivity: 'accent' }
    : undefined;

  return [
    ...(prompt ? [<option value="">{prompt}</option>] : []),
    ...items.map(item => {
      const value = valueAttr ? item[valueAttr] : null;
      const isSelected =
        selected !== undefined &&
        selected.localeCompare(
          String(item[textAttr]),
          undefined,
          stringComparisonConfig
        ) === 0
          ? true
          : null;
      return (
        <option value={value} selected={isSelected}>
          {item[textAttr]}
        </option>
      );
    })
  ];
};

export default Options;
