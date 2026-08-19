import { Routes, Route, Navigate } from "react-router-dom";
import { CommerceLayout } from "@/layouts";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<CommerceLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
