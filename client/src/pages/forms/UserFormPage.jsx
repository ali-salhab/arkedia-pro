import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import UserFormModal from "../../components/UserFormModal";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../store/services/api";

export default function UserFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user = state?.user || null;
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
    <div className="max-w-5xl mx-auto space-y-4">
      <button
        onClick={handleClose}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

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
