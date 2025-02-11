import Pet from "../pet/pet.model.js";
import Appointment from "../appointment/appointment.model.js";
import User from "../user/user.model.js";
import { parse } from "date-fns";

export const saveAppointment = async (req, res) => {
  try {
    const data = req.body;

    const isoDate = new Date(data.date);

    if (isNaN(isoDate.getTime())) {
      return res.status(400).json({
        success: false,
        msg: "Fecha inválida",
      });
    }

    const pet = await Pet.findOne({ _id: data.pet });
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        msg: "No se encontró la mascota" 
      });
    }

    const existAppointment = await Appointment.findOne({
      pet: data.pet,
      user: data.user,
      date: {
        $gte: new Date(isoDate).setHours(0, 0, 0, 0),
        $lt: new Date(isoDate).setHours(23, 59, 59, 999),
      },
    });

    if (existAppointment) {
      return res.status(400).json({
        success: false,
        msg: "El usuario y la mascota ya tienen una cita para este día",
      });
    }

    const appointment = new Appointment({ ...data, date: isoDate });
    await appointment.save();

    return res.status(200).json({
      success: true,
      msg: `Cita creada exitosamente en fecha ${data.date}`,
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      msg: "Error al crear la cita", 
      error 
    }); 
  }
};

/**
 * Muestra en forma de lista las citas de un solo usuario, y su informacion vinvulada a esta.
 * Recibe el id del usuario como param y lo busca en la base de datos la cita y la informacion 
 * de la mascota. 
 */
export const citasUsuario = async (req, res) => {
  try {
      const { uid } = req.params;
      
      const appointments = await Appointment.find({ user: uid }).populate("pet", "name description");

      if (!appointments || appointments.length === 0) {
          return res.status(404).json({
              success: false,
              message: "No se encontraron citas de este usuario"
          });
      }

      return res.status(200).json({
          success: true,
          appointments
      });
  } catch (err) {
      return res.status(500).json({
          success: false,
          message: "Error al obtener las citas",
          error: err.message
      });
  }
};

/**
 * Este modifica las citas recibiendo los id de la cita y el user, este busca la cita y verifica que le pertenezca.
 * Este solo recibe y modifica el estado y la fecha en la base de datos.
 */
export const actualizarCita = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Cita no encontrada"
            });
        }
        
        if (appointment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Esta cita no pertenece al usuario"
            });
        }
        
        const { date, status } = req.body;
        if (date) appointment.date = date;
        if (status) appointment.status = status;
        
        await appointment.save();
        
        return res.status(200).json({
            success: true,
            message: "Cita actualizada correctamente",
            appointment
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar la cita",
            error: err.message
        });
    }
};

/**
* Elimina las citas,se envia el id  de la cita creada y este moifica el status de la cita a CANCELLED.
*En caso de no rncontrarlo tira un 404  y un 505 si hay un error. 
 */
export const cancelCita = async (req, res) => { 
  const { uid } = req.params; 

  try {
      const appointment = await Appointment.findById(uid);
      if (!appointment) {
          return res.status(404).json({ message: 'Cita no encontrada' });
      }
      appointment.status = 'CANCELLED';

      await appointment.save();

      return res.status(200).json({
          message: 'Cita cancelada con éxito',
          appointment
      });
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: 'Error al cancelar la cita' });
  }
};
