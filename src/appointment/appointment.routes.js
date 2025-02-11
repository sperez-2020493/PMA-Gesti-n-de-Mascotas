import { Router } from "express";
import { saveAppointment, citasUsuario, actualizarCita, cancelCita } from "./appointment.controller.js";
import { createAppointmentValidator, getUserByIdValidator } from "../middlewares/appointment-validators.js";

const router = Router();

router.post("/createAppointment", createAppointmentValidator, saveAppointment);

router.get("/citasUsuario/:uid", getUserByIdValidator, citasUsuario);

router.put("/modificarCita", actualizarCita );

router.put("/cancelarCita/:uid", cancelCita);


export default router;