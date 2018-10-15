import { CSSProperties, Component, createElement } from "react";

import { BootstrapStyle, Slider } from "./Slider";

interface SliderContainerProps {
    class: string;
    style: CSSProperties;
    bootstrapStyle: BootstrapStyle;
    decimalPlaces: number;
    maxAttribute: PluginWidget.DynamicValue<string>;
    minAttribute: PluginWidget.DynamicValue<string>;
    noOfMarkers: number;
    stepValue: number;
    stepAttribute: PluginWidget.DynamicValue<string>;
    tooltipText: PluginWidget.DynamicValue<string>;
    valueAttribute: PluginWidget.EditableValue<string>;
    editable: "default" | "never";
    onChangeAction?: PluginWidget.ActionValue;
}

type Handler = () => void;

class SliderContainer extends Component<SliderContainerProps> {
    private readonly onChangeHandler: Handler = this.handleAction.bind(this);
    private readonly onUpdateHandler: Handler = this.onUpdate.bind(this);

    render() {
        const { valueAttribute, editable, maxAttribute, minAttribute, stepAttribute, tooltipText, stepValue } = this.props;
        const disabled = editable === "default" ? valueAttribute && valueAttribute.readOnly : true;
        const value = valueAttribute ? Number(valueAttribute.value) : undefined;
        const maxAttributeValue = maxAttribute.value ? Number(maxAttribute.value) : undefined;
        const minAttributeValue = minAttribute.value ? Number(minAttribute.value) : undefined;
        const stepAttributeValue = stepAttribute.value ? Number(stepAttribute.value) : stepValue;
        const tooltipTextValue = tooltipText ? String(tooltipText) : undefined;
        const alertMessage = !disabled ? this.validateSettings(this.props) || this.validateValues() : "";

        return createElement(Slider, {
            alertMessage,
            bootstrapStyle: this.props.bootstrapStyle,
            className: this.props.class,
            decimalPlaces: this.props.decimalPlaces,
            disabled,
            maxValue: maxAttributeValue,
            minValue: minAttributeValue,
            noOfMarkers: this.props.noOfMarkers,
            onChange: this.onChangeHandler,
            onUpdate: this.onUpdateHandler,
            stepValue: stepAttributeValue,
            style: this.props.style,
            tooltipText: tooltipTextValue,
            value: (value || value === 0) ? value : null
        });
    }

    private validateSettings(props: SliderContainerProps): string {
        const message: string[] = [];
        const { minAttribute, maxAttribute, stepValue } = props;
        const maximumValue = Number(maxAttribute.value);
        const minimumValue = Number(minAttribute.value);

        if (maximumValue && minimumValue && stepValue) {
            const quotient = Math.floor((maximumValue - minimumValue) / stepValue);
            const product = quotient * stepValue;
            const remainder = (maximumValue - minimumValue) - product;

            if (remainder > 0) {
                message.push(`Step value is invalid: max - min (${maximumValue} - ${minimumValue})
            should be evenly divisible by the step value ${stepValue}`);
            }
        }
        if (minimumValue > maximumValue) {
            message.push(`Minimum value ${minimumValue} should be less than or equal to the maximum value ${maximumValue}`); // tslint:disable:max-line-length
        }
        if (!stepValue || stepValue <= 0) {
            message.push(`Step value ${stepValue} should be greater than 0`);
        }

        return message.join(", ");
    }

    private onUpdate(value: number) {
        const { valueAttribute, maxAttribute } = this.props;
        if (value || value === 0) {
            if ((maxAttribute.value || Number(maxAttribute.value) === 0) && (value > Number(maxAttribute.value))) {
                valueAttribute.setTextValue(maxAttribute.value as string);
            } else {
                valueAttribute.setTextValue(value.toString());
            }
        }
    }

    private handleAction(value: number) {
        if (value || value === 0) {
            this.executeAction();
        }
    }

    private executeAction() {
        if (this.props.onChangeAction) {
            this.props.onChangeAction.execute();
        }
    }

    private validateValues(): string {
        const message: string[] = [];
        const { minAttribute, maxAttribute, valueAttribute } = this.props;
        if (Number(valueAttribute.value) > Number(maxAttribute.value)) {
            message.push(`Value ${valueAttribute.value} should be less than the maximum ${maxAttribute.value}`);
        }
        if (Number(valueAttribute.value) < Number(minAttribute.value)) {
            message.push(`Value ${valueAttribute.value} should be greater than the minimum ${minAttribute.value}`);
        }

        return message.join(", ");
    }
}

export { SliderContainer as default, SliderContainerProps };
