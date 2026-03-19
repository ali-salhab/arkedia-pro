import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RoomFormModal from "../../components/RoomFormModal";
import {
  useCreateRoomMutation,
  useUpdateRoomMutation,
} from "../../store/services/api";

export default function RoomFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const room = state?.room || null;
  const backTo = state?.backTo || -1;

  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();

  const handleSave = async (data) => {
    if (room?._id) {
      await updateRoom({ _id: room._id, ...data }).unwrap();
    } else {
      await createRoom(data).unwrap();
    }
    navigate(backTo);
  };

  const handleClose = () => navigate(backTo);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button
        onClick={handleClose}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <RoomFormModal
        open={true}
        pageMode={true}
        onClose={handleClose}
        onSave={handleSave}
        room={room}
      />
    </div>
  );
}
