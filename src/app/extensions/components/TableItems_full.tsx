import React, { useMemo, useState } from "react";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableFooter, Text } from "@hubspot/ui-extensions";

type SortDirection = NonNullable<"none" | "ascending" | "descending">;

export type TableColumn<T> = {
	key: keyof T | string; // permite keys del objeto o strings (por si usas campos dinámicos)
	header: string; // título de la columna
	width?: "min" | "max" | "auto"; // lo que soporte tu TableHeader/TableCell
	render?: (row: T) => React.ReactNode; // opcional: render custom por celda
};
type TableItemsProps<T extends { id: string }> = {
	items?: T[];
	columns: TableColumn<T>[];
	emptyText?: string;
	bordered?: boolean;
};

export function TableItemsFull<T extends { id: string }>({ items, columns, emptyText = "No line items found.", bordered = true }: TableItemsProps<T>) {
	const safeItems = items ?? [];

	// estado de sort por columna
	const DEFAULT_SORT_STATE = useMemo(() => {
		const state: Record<string, SortDirection> = {};
		for (const c of columns) state[String(c.key)] = "none";
		return state;
	}, [columns]);

	const [sortState, setSortState] = useState<Record<string, SortDirection>>(DEFAULT_SORT_STATE);

	function handleOnSort(colKey: string, sortDirection: SortDirection) {
		// Solo una columna activa como tu ejemplo
		setSortState({
			...DEFAULT_SORT_STATE,
			[colKey]: sortDirection,
		});
	}

	const sortedData = useMemo(() => {
		const active = Object.entries(sortState).find(([, dir]) => dir !== "none");
		if (!active) return safeItems;

		const [activeKey, direction] = active;
		const col = columns.find((c) => String(c.key) === activeKey);
		if (!col) return safeItems;

		return [...safeItems].sort((a, b) => {
			const av = (a as any)[col.key as any];
			const bv = (b as any)[col.key as any];

			// numérico si aplica, si no string
			const an = Number(av);
			const bn = Number(bv);
			const bothNumeric = !Number.isNaN(an) && !Number.isNaN(bn);

			let result = 0;
			if (bothNumeric) {
				result = an < bn ? -1 : an > bn ? 1 : 0;
			} else {
				result = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
			}

			if (direction === "ascending") return result;
			if (direction === "descending") return -result;
			return 0;
		});
	}, [safeItems, sortState, columns]);

	if (safeItems.length === 0) {
		return <Text>{emptyText}</Text>;
	}

	return (
		<Table bordered={bordered}>
			<TableHead>
				<TableRow>
					{columns.map((col) => {
						const colKey = String(col.key);
						return (
							<TableHeader
								key={colKey}
								width={col.width ?? "min"}
								sortDirection={sortState[colKey]}
								onSortChange={(value: SortDirection) => handleOnSort(colKey, value)}
							>
								{col.header}
							</TableHeader>
						);
					})}
				</TableRow>
			</TableHead>

			<TableBody>
				{sortedData.map((row) => (
					<TableRow key={row.id}>
						{columns.map((col) => (
							<TableCell key={String(col.key)} width={col.width ?? "min"}>
								{col.render?.(row) ?? (row as any)[col.key as any]}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
