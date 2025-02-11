import { hash } from "argon2";
import User from "./user.model.js"

export const getUserById = async (req, res) => {
    try{
        const { uid } = req.params;
        const user = await User.findById(uid)

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            })
        }

        return res.status(200).json({
            success: true,
            user
        })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al obtener el usuario",
            error: err.message
        })
    }
}

export const getUsers = async (req, res) => {
    try{
        const { limite = 5, desde = 0 } = req.query
        const query = { status: true }

        const [total, users ] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        return res.status(200).json({
            success: true,
            total,
            users
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al obtener los usuarios",
            error: err.message
        })
    }
}

export const deleteUser = async (req, res) => {
    try{
        const { uid } = req.params
        
        const user = await User.findByIdAndUpdate(uid, {status: false}, {new: true})

        return res.status(200).json({
            success: true,
            message: "Usuario eliminado",
            user
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el usuario",
            error: err.message
        })
    }
}

export const updatePassword = async (req, res) => {
    try{
        const { uid } = req.params
        const { newPassword } = req.body

        const user = await User.findById(uid)

        const matchOldAndNewPassword = await verify(user.password, newPassword)

        if(matchOldAndNewPassword){
            return res.status(400).json({
                success: false,
                message: "La nueva contraseña no puede ser igual a la anterior"
            })
        }

        const encryptedPassword = await hash(newPassword)

        await User.findByIdAndUpdate(uid, {password: encryptedPassword}, {new: true})

        return res.status(200).json({
            success: true,
            message: "Contraseña actualizada",
        })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al actualizar contraseña",
            error: err.message
        })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const  data  = req.body;

        const user = await User.findByIdAndUpdate(uid, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Usuario Actualizado',
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar usuario',
            error: err.message
        });
    }
}

/**
 * 
 *La función permite al usuario subir una nueva foto de perfil, 
 *elimina la foto antigua (si existe) y guarda la nueva imagen en la base de datos.
 */
export const updateProfilePicture = async (req, res) =>{
    try{
        const {uid} = req.params
        let newProfilePicture = req.file ? req.file.filename : null

        const user = await User.findById(uid)
        if(!newProfilePicture){
            return res.status(400).json({
                success: false,
                msg: "No se proporciono ningun archivo"
            })
        }
        if(user.profilePicture){
            const oldProfilePicture = join(__dirname, "../../public/uploads/profile-pictures", user.profilePicture)
            await fs.unlink(oldProfilePicture)
        }
        user.profilePicture = newProfilePicture
        await user.save()

        res.status(200).json({
            success: true,
            message: "Foto de perfil actualizada",
            user
        })
        
    }catch(err){
        return res.status(500).json({
            success: false,
            msg: "Error al agregar el usuario",
            error: err.message
        })
    }
}