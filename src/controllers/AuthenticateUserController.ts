import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";

class AuthenticateUserController {
    async handle(request: Request, response: Response) {

        // Pega o que está dentro de request.body
        const { code } = request.body;

        const service = new AuthenticateUserService();
        try {
            const result = await service.execute(code)
            // O .execute FAZ O QUE EXATAMENTE AQUI?
            return response.json(result);
        } catch (err) {
            return response.json({error: err.message});
        }
    }
}

export { AuthenticateUserController }