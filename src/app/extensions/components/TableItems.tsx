import React from "react";
import { Text, Flex } from "@hubspot/ui-extensions";
import { FieldHeader } from "./Field";

export type Column<T> = {
	key: keyof T | string;
	header: string;
	render?: (item: T) => React.ReactNode;
};
type TableItemsProps<T extends { id: string }> = {
	items?: T[];
	columns: Column<T>[];
	emptyText?: string;
};

export function TableItems<T extends { id: string }>({ items, columns, emptyText = "No items found." }: TableItemsProps<T>) {
	if (!items || items.length === 0) {
		return <Text>{emptyText}</Text>;
	}

	return (
		<Flex direction="column" justify="center" align="start">
			<Flex direction="row" align="center" gap="small">
				{columns.map((col) => (
					<FieldHeader key={col.key as string} title={col.header} />
				))}
			</Flex>

			{items.map((item) => (
				<Flex key={item.id} direction="row" align="center" gap="small">
					{columns.map((col) => (
						<Flex key={String(col.key)} alignSelf="center">
							{col.render ? col.render(item) : <Text>{item[col.key as keyof T] as string}</Text>}
						</Flex>
					))}
				</Flex>
			))}
		</Flex>
	);
}
