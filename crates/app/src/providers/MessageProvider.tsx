import {createContext, ReactNode, useContext, useState, useEffect} from "react";
import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {Icon} from "@iconify/react";

/**
 * Represents options used for a yes/no message response.
 *
 * This type extends MessageOptions to include a specific responseType of YesNo.
 * It is used where the response to a message requires a binary choice, typically yes or no.
 *
 * The responseType property is set to MessageResponseType.YesNo to explicitly define the nature of the message response.
 *
 * This type can be used to define configuration for yes/no interaction messages, combining additional options
 * inherited from MessageOptions.
 */
type YesNoOptions = MessageOptions & { responseType: MessageResponseType.YesNo };
/**
 * Represents configuration options for a message that requires an "Okay" or "Cancel" response.
 *
 * This type extends the base `MessageOptions` type while specifying the `responseType`
 * property as `MessageResponseType.OkayCancel`. It is used to configure and customize
 * the behavior and display of a message dialog that provides two response choices: "Okay" and "Cancel".
 *
 * The properties of this type include all properties from `MessageOptions` along
 * with the `responseType` being explicitly required to be `MessageResponseType.OkayCancel`.
 *
 * Use this type to ensure consistency in defining options for messages that support
 * dual responses, guaranteeing that the responseType is set appropriately.
 */
type OkayCancelOptions = MessageOptions & { responseType: MessageResponseType.OkayCancel };
/**
 * Represents the options for closing a message or a communication channel.
 * It extends the `MessageOptions` type and is specifically used when the
 * `responseType` is set to `MessageResponseType.Close`.
 *
 * This type is utilized to define attributes that dictate how a close
 * response should behave or be processed within the system. Use it to
 * configure the parameters and metadata associated with closing operations.
 *
 * It is required to combine this type with a `responseType` of
 * `MessageResponseType.Close` for operation specificity.
 */
type CloseOptions = MessageOptions & { responseType: MessageResponseType.Close };

/**
 * Represents a context type for handling different message dialogs. The interface provides
 * method overloads to open dialogs with various options and handle their resolutions based on
 * the specified configuration.
 */
interface MessageContextType
{
    /**
     * Opens a resource or initializes a process based on the provided options.
     *
     * @param {YesNoOptions} options - The configuration options to be used for the operation.
     * @return {Promise<boolean>} A promise that resolves to a boolean indicating the success or failure of the operation.
     */
    open(options: YesNoOptions): Promise<boolean>;

    /**
     * Opens a dialog or modal based on the provided options and returns a promise
     * that resolves with the user's action.
     *
     * @param {OkayCancelOptions} options - Configuration options for the dialog,
     * including display text, button labels, and other settings.
     * @return {Promise<boolean>} A promise that resolves to a boolean indicating
     * whether the "Okay" button was pressed (true) or the "Cancel" button was
     * pressed (false).
     */
    open(options: OkayCancelOptions): Promise<boolean>;

    /**
     * Opens a resource or initiates a process based on the provided options.
     *
     * @param {CloseOptions} options - The options that define the parameters for the open operation.
     * @return {Promise<void>} A promise that resolves when the operation is completed, or rejects if an error occurs.
     */
    open(options: CloseOptions): Promise<void>;

    /**
     * Opens a resource or initiates an action based on the specified options.
     *
     * @param {MessageOptions} options - The configuration options for opening the resource or initiating the action.
     * @return {Promise<boolean | null>} A promise that resolves to a boolean indicating success, resolves to null if the operation is unsupported, or rejects with an error if the operation fails.
     */
    open(options: MessageOptions): Promise<boolean | null>;
}

/**
 * MessageContext is a React context that provides a way to manage and access
 * message-related data or functionality throughout a component tree.
 *
 * This context is initialized with a default value of `undefined` and is designed
 * to work with `MessageContextType`. It must be properly initialized with a
 * valid provider to use its value within any consuming components.
 *
 * Typically used for scenarios where message data or actions (e.g., sending,
 * updating, or retrieving messages) need to be shared and accessed across
 * different components without prop drilling.
 */
const MessageContext = createContext<MessageContextType | undefined>(undefined);

/**
 * Provides a message context that can be used to display modal dialogs with configurable options.
 * The provider manages the state of the modal dialog and handles promises to return user responses.
 *
 * @param {object} props - The properties for the MessageProvider component.
 * @param {ReactNode} props.children - The child components to be rendered inside the provider.
 *
 * @return {JSX.Element} The MessageContext.Provider wrapping the children and the modal dialog.
 */
export function MessageProvider({children}: { children: ReactNode })
{
    const [messageOptions, setMessageOptions] = useState<MessageOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean | null | void) => void) | null>(null);

    const open = (options: MessageOptions): Promise<boolean | null | void> =>
    {
        return new Promise((resolve) =>
        {
            setMessageOptions(options);
            setResolvePromise(() => resolve);
        });
    };

    const handleClose = (response: boolean | null) =>
    {
        setMessageOptions(null);
        if (resolvePromise)
        {
            if (messageOptions?.responseType === MessageResponseType.Close)
            {
                resolvePromise(undefined); // void for Close type
            } else
            {
                resolvePromise(response === null ? false : response); // guarantee boolean for YesNo/OkayCancel
            }
            setResolvePromise(null);
        }
    };

    return (
        <MessageContext.Provider value={{open: open as MessageContextType["open"]}}>
            <MessageModal
                isOpen={messageOptions != null}
                title={messageOptions?.title ?? ""}
                body={messageOptions?.body ?? ""}
                responseType={messageOptions?.responseType ?? MessageResponseType.Close}
                severity={messageOptions?.severity}
                onClose={handleClose}
            />
            {children}
        </MessageContext.Provider>
    );
}

/**
 * A custom hook that provides access to the MessageContext.
 * This hook must be used within a MessageProvider, otherwise it will throw an error.
 *
 * @return {MessageContextType} The context object provided by the MessageContext provider.
 */
export function useMessage(): MessageContextType
{
    const context = useContext(MessageContext);
    if (!context)
    {
        throw new Error("useMessage must be used within a MessageProvider");
    }
    return context;
}


/**
 * Represents the options that can be used to configure and display a message.
 */
export type MessageOptions = {
     // Represents the title of an object or entity. Typically used as a descriptive or identifying name.
    title: string;
    // Represents the content to be displayed, which can be either a ReactNode or a string.
    body: ReactNode | string;
    /**
     * The `responseType` variable specifies the expected type of the response
     * from a message handling operation. It is used to determine how the response
     * should be interpreted or processed within the system.
     *
     * The `MessageResponseType` can represent different response formats or
     * categories, depending on the context of its usage, such as success,
     * error, or informational responses.
     */
    responseType: MessageResponseType;
    /**
     * Represents the severity level of a message or notification.
     * Can be used to classify and style messages based on their importance or type.
     *
     * Optional values:
     * - "info": Represents informational messages that are not critical (e.g., general notices).
     * - "warning": Indicates caution or potential issues requiring attention.
     * - "danger": Denotes serious issues or errors that need immediate resolution.
     * - "success": Represents successful outcomes or actions.
     */
    severity?: "info" | "warning" | "danger" | "success";
    // An optional icon to display with the message. Can be a ReactNode or a string.
    icon?: ReactNode | string;
}

/**
 * Represents the properties for configuring a message component.
 * This type combines the required message behavior properties along with
 * additional message options from `MessageOptions`.
 * @mixes MessageOptions Includes additional configurable options defined in the `MessageOptions` type.
 */
type MessageProperties = {
    // Indicates whether the message component is currently displayed.
    isOpen: boolean;
    /// Callback function triggered when the message component is closed.
    onClose: (response: boolean | null) => void;
} & MessageOptions;

/**
 * Enumeration representing the types of message responses that can be used in a user interface.
 *
 * This enum defines a set of predefined response types for modal dialogs or message prompts,
 * enabling consistent handling of user interactions.
 *
 * Enumerated values:
 * - `YesNo`: Represents a dialog or prompt where the user is expected to choose between "Yes" and "No".
 * - `OkayCancel`: Represents a dialog or prompt where the user is expected to choose between "Okay" and "Cancel".
 * - `Close`: Represents a dialog or prompt where the only action available is dismissing or closing the message.
 */
export enum MessageResponseType
{
    // This will show two buttons saying "Yes" and "No"
    YesNo,
    // This will show two buttons saying "Okay" and "Cancel"
    OkayCancel,
    // This will only show a single button to close the message
    Close,
}

/**
 * Renders a modal dialog with a customizable message, icon, title, body, and response actions.
 * This modal allows for keyboard interaction using the Enter or Space key to trigger the primary action.
 *
 * @param {Object} props - Properties used to configure the modal.
 * @param {string} props.title - The title displayed in the modal header.
 * @param {React.ReactNode} props.body - The content displayed in the modal body.
 * @param {string} props.responseType - The type of response buttons to display (e.g., Yes/No, Okay/Cancel, Close).
 * @param {string|React.ReactNode|null} [props.icon] - The icon displayed in the modal header, either as a string (icon name) or a React node.
 * @param {string} props.severity - The severity level of the modal (e.g., danger, warning, info, success), which determines styling.
 * @param {boolean} props.isOpen - A boolean indicating whether the modal is currently visible.
 * @param {function} props.onClose - A callback function triggered when the modal is closed, receiving a boolean or null response.
 *
 * @return {JSX.Element} A modal component with the configured content and actions.
 */
export function MessageModal(props: MessageProperties)
{
    const {
        title,
        body,
        responseType,
        icon,
        severity,
        isOpen,
        onClose
    } = props;

    // Handle keyboard events for Enter and Space
    useEffect(() =>
    {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) =>
        {
            if (event.key === "Enter" || event.key === " ")
            {
                event.preventDefault();
                event.stopPropagation();
                // Trigger the primary action (Yes/Okay/Close)
                onClose(true);
            }
        };

        // Add event listener when modal is open
        document.addEventListener("keydown", handleKeyDown);

        // Cleanup event listener when modal closes or component unmounts
        return () =>
        {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onClose(responseType === MessageResponseType.Close ? null : false)}
            scrollBehavior={"inside"}
            backdrop={"blur"}
            classNames={{
                backdrop: severity === "danger" ? "bg-danger/10" : ""
            }}
            data-severity={severity}
            isDismissable={false}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className={"flex flex-row items-center gap-2 text-2xl"}>
                            <span className={"text-3xl h-[30px]"}>{typeof icon === "string" ? <Icon icon={icon}/> : icon == null ? <MessageIcon severity={severity}/> : icon}</span>
                            <span
                                className={"data-[severity=danger]:text-danger data-[severity=warning]:text-warning data-[severity=info]:text-blue-500 data-[severity=success]:text-success"}
                                data-severity={severity}
                            >
                                {title}
                            </span>
                        </ModalHeader>
                        <ModalBody>
                            {body}
                        </ModalBody>
                        <ModalFooter>
                            {({
                                [MessageResponseType.YesNo]: (
                                    <>
                                        <Button radius={"full"} onPress={() => onClose(true)} color={severity === "danger" ? "danger" : "primary"} autoFocus>Yes</Button>
                                        <Button radius={"full"} onPress={() => onClose(false)} variant={"light"}>No</Button>
                                    </>
                                ),
                                [MessageResponseType.OkayCancel]: (
                                    <>
                                        <Button radius={"full"} onPress={() => onClose(true)} color={severity === "danger" ? "danger" : "primary"} autoFocus>Okay</Button>
                                        <Button radius={"full"} onPress={() => onClose(false)} variant={"light"}>Cancel</Button>
                                    </>
                                ),
                                [MessageResponseType.Close]: (
                                    <Button radius={"full"} onPress={() => onClose(true)} autoFocus>Close</Button>
                                )
                            })[responseType]}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

/**
 * A functional component that renders an appropriate icon based on the severity level.
 *
 * @param {Object} props - The properties object.
 * @param {"info" | "warning" | "danger" | "success" | undefined} props.severity - The severity level of the message. Determines the specific icon and corresponding style to be displayed.
 * @returns {JSX.Element | null} Returns a JSX element containing the severity icon or null if the severity is undefined.
 */
const MessageIcon = ({severity}: { severity: "info" | "warning" | "danger" | "success" | undefined }) =>
{
    switch (severity)
    {
        case "info":
            return <Icon icon={"mage:information-circle-fill"} className={"text-blue-500"}/>;
        case "warning":
            return <Icon icon={"mage:exclamation-triangle-fill"} className={"text-warning"}/>;
        case "danger":
            return <Icon icon={"mage:exclamation-hexagon-fill"} className={"text-danger"}/>;
        case "success":
            return <Icon icon={"mage:check-circle-fill"} className={"text-success"}/>;
        default:
            return null;
    }
};