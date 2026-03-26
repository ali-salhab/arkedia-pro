import { useNavigate, useLocation } from "react-router-dom";
import UserFormModal from "../../components/UserFormModal";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../store/services/api";

export default function UserFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user =
    state?.user || state?.hotel || state?.restaurant || state?.activity || null;
  const fixedRole = state?.fixedRole || null;
  const adminsList = state?.adminsList || [];
  const backTo = state?.backTo || -1;

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleSave = async (data) => {
    if (data._id) {
      await updateUser({ _id: data._id, ...data }).unwrap();
    } else {
      await createUser(data).unwrap();
    }
    navigate(backTo);
  };

  const handleClose = () => navigate(backTo);

  return (
    <div className="mx-auto w-full max-w-7xl px-1 sm:px-2">
      <UserFormModal
        open={true}
        pageMode={true}
        onClose={handleClose}
        onSave={handleSave}
        user={user}
        fixedRole={fixedRole}
        adminsList={adminsList}
      />
    </div>
  );
}
