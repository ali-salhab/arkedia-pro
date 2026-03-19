import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BookingFormModal from "../../components/BookingFormModal";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
} from "../../store/services/api";

export default function BookingFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const booking = state?.booking || null;
  const backTo = state?.backTo || -1;

  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();

  const handleSave = async (data) => {
    if (booking?._id) {
      await updateBooking({ _id: booking._id, ...data }).unwrap();
    } else {
      await createBooking(data).unwrap();
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

      <BookingFormModal
        open={true}
        pageMode={true}
        onClose={handleClose}
        onSave={handleSave}
        booking={booking}
      />
    </div>
  );
}
