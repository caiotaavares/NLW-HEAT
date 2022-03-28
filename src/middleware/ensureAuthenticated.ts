import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
    sub: string
}

export function ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const authToken = request.headers.authorization;
    
    if (!authToken) {
        return response.status(401).json({
            errorCode: "token.invalid"
        });
    }

    // Como o token vem no formato: Bearer asldh190asdlkhasd80hdoah1
    // É preciso separar, pois apenas o "asldh190asdlkhasd80hdoah1" interessa

    const [, token] = authToken.split(" ");
    // Dessa forma fica:
    // [0] Bearer
    // [1] asldh190asdlkhasd80hdoah1

    try {
        const { sub } = verify(token, process.env.JWT_SECRET) as IPayload

        request.user_id = sub

        return next();
        
    } catch (err) {
        return response.status(401).json({ errorCode: "token.expired"})
    }

}