import { prisma } from "@prisma/client";
import axios from "axios";
import prismaClient from "../prisma"
import { sign } from "jsonwebtoken";

/**
 * Receber code(string)
 * Recuperar o access_token no github 
 * Recuperar infos do user no github
 *      access_token = token disponibilizado pelo github
 *      que permite que da acesso as informações do usuário
 * Verificar se o usuário existe no BD
 * ------ SIM = Gera um token
 * ------ NAO = Cria no BD, gera um token
 * Retornar o token com as infos do user
 */

interface IAccessTokenResponse {
    access_token: string;
}

interface IUserResponse {
    avatar_url: string,
    login: string,
    id: number,
    name: string
}

// O QUE É O TIPO INTERFACE? DE ONDE ELE VEM?

class AuthenticateUserService {
    // Receber code(string)
    async execute(code: string) {
        const url = "https://github.com/login/oauth/access_token";
        
        
        // Recupera o access_token no github
        // O <IAccessTokenResponse> define o tipo do retorno
        const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
            params: {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            },
            headers: {
                "Accept": "application/json"
            }
        })

        // Recuperar infos do user no github
        // O <IUserResponse> define o tipo do retorno
        const response = await axios.get<IUserResponse>("http://api.github.com/user", {
            headers: {
                authorization: `Bearer ${accessTokenResponse.access_token}`
            }
        });

        // Desestruturação dentro do response.data
        const { login, id, avatar_url, name } = response.data
        /*
        * Verificar se o usuário existe no BD
        * ------ SIM = Gera um token
        * ------ NAO = Cria no BD, gera um token
        */
        let user = await prismaClient.user.findFirst({
            where: {
                github_id: id
            }
        })

        if(!user) {
            user = await prismaClient.user.create({
                data: {
                    github_id: id,
                    login,
                    avatar_url,
                    name
                }
            })
        }

        const token = sign(
        {
            user: {
                name: user.name,
                avatar_url: user.avatar_url,
                id: user.id
            }
        },
        process.env.JWT_SECRET,
        {
            subject: user.id,
            expiresIn: "1d"
        }
        )

        //retorna os dados armazenados em response
        return { token, user };
    }
}

export { AuthenticateUserService }