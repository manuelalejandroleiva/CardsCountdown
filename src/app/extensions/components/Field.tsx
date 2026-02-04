import { Flex, Box, Text, Divider, Link } from "@hubspot/ui-extensions";
import React from "react";

type BaseFieldProps = {
	item: string;
	name: string;
};

type TextFieldProps = BaseFieldProps & {
	as?: "text";
};

type LinkFieldProps = BaseFieldProps & {
	as: "link";
	to: string;
};

type FieldProps = TextFieldProps | LinkFieldProps;
export default function Field(props: FieldProps) {
	const { item, name } = props;

	const renderComponent = () => {
		switch (props.as) {
			case "text":
				return <Text>{item}</Text>;
			case "link":
				return <Link href={props.to}>{item}</Link>;
			default:
				return <Text>{item}</Text>;
		}
	};

	return (
		<Flex direction="column" justify="center">
			{/* <Box flex={2 / 3}>{children}</Box> */}
			<Text format={{ fontWeight: "bold" }}>{name}</Text>
			{renderComponent()}
			<Divider />
		</Flex>
	);
}

type BaseFieldCellProps = {
	item: string;
};

type TextFieldCellProps = BaseFieldCellProps & {
	as?: "text";
};

type LinkFieldCellProps = BaseFieldCellProps & {
	as: "link";
	href: string;
};

type FieldCellProps = TextFieldCellProps | LinkFieldCellProps;

export function FieldHeader({ title }: { title: string }) {
	return (
		<Flex alignSelf="center">
			<Text format={{ fontWeight: "bold" }}>{title}</Text>
		</Flex>
	);
}
export function FieldCell(props: FieldCellProps) {
	const { item } = props;

	const renderComponent = () => {
		switch (props.as) {
			case "text":
				return <Text>{item}</Text>;
			case "link":
				return <Link href={props.href}>{item}</Link>;
			default:
				return <Text>{item}</Text>;
		}
	};

	return (
		// <Flex alignSelf="center">
		<>{renderComponent()}</>
		// </Flex>
	);
}
