import { useDispatch, useSelector } from "react-redux";
import { ErrorModal } from "./Modal";
import { hideGlobalError } from "../store/slices/uiSlice";

export default function GlobalErrorModal() {
  const dispatch = useDispatch();
  const globalError = useSelector((state) => state.ui?.globalError);

  if (!globalError) return null;

  const message =
    globalError.status != null
      ? `[${globalError.status}] ${globalError.message}`
      : globalError.message;

  return (
    <ErrorModal
      open={Boolean(globalError)}
      onClose={() => dispatch(hideGlobalError())}
      message={message}
    />
  );
}
