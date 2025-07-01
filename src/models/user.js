import { dbManager } from "../config/database.js";

//-------------User Sign Up API--------------------------------------
export async function createUser(name, email, hashedPassword) {
    try {
        const [userResult] = await dbManager.query(
            `
        INSERT INTO user (name,email,password)
        VALUES(?,?,?);
        `,
            [name, email, hashedPassword]
        );
        const [providerResult] = await dbManager.query(
            `
        INSERT INTO providers (user_id,provider)
        VALUES(?,?);
        `,
            [userResult.insertId, "native"]
        );
        return userResult;
    } catch (err) {
        if (err.errno === 1062) {
            return false;
        }
        throw err;
    }
}
export async function createFbUser(name, email) {
    try {
        const [userResult] = await dbManager.query(
            `
        INSERT INTO user (name,email)
        VALUES(?,?);
`,
            [name, email]
        );
        const [providerResult] = await dbManager.query(
            `
        INSERT INTO providers (user_id,provider)
        VALUES(?,?);
        `,
            [userResult.insertId, "facebook"]
        );
        return userResult;
    } catch (err) {
        if (err.errno === 1062) {
            return false;
        }
        throw err;
    }
}
//-------------User Sign In API-----------------------------------------
export async function checkUser(email, provider) {
    const [userResult] = await dbManager.query(
        `
    SELECT user.id
    FROM user
    WHERE  email = ? ;
    `,
        [email]
    );

    if (userResult[0]) {
        const [providerResult] = await dbManager.query(
            `
        SELECT providers.provider
        FROM providers
        WHERE  user_id = ? ;
        `,
            [userResult[0].id]
        );

        return [userResult[0].id, providerResult];
    } else {
        return false;
    }
}

export async function userSignIn(email) {
    const [signInResult] = await dbManager.query(
        `
    SELECT user.password
    FROM user
    WHERE  email = ? ;
    `,
        [email]
    );
    return signInResult;
}
//-------------SignIn success return-----------------------------------
export async function signInSuccess(email, provider) {
    const [signInResult] = await dbManager.query(
        `
    SELECT user.id,user.name,user.email,user.picture
    FROM user
    WHERE  email = ? ;
    `,
        [email]
    );
    signInResult[0].provider = provider;
    return signInResult[0];
}

//-------------User Profile API-----------------------------------------
export async function getUserprofile(userId, provider) {
    try {
        const [userData] = await dbManager.query(
            `
    SELECT user.name,user.email,user.picture
    FROM user
    WHERE id = ?;
    `,
            [userId]
        );
        userData[0].provider = provider;
        const result = {};
        result.data = userData[0];
        return result;
    } catch (err) {
        throw err;
    }
}

//------------User Role Access Apply-------------------------------------

export async function createRole(role, accessArr) {
    const [roleResult] = await dbManager.query(
        `
        INSERT INTO roles (role,access)
        VALUES(?,?);
    `,
        [role, accessArr]
    );
    return roleResult;
}

export async function assignRole(userId, roleId) {
    const [userRole] = await dbManager.query(
        `
        UPDATE user
        SET role_id= ?
        WHERE id = ?;
    `,
        [roleId, userId]
    );
    return userRole;
}

export async function getUserAccess(userId) {
    try {
        const [userRole] = await dbManager.query(
            `
        SELECT role_id
        FROM user
        WHERE user.id= ? ;
    `,
            [userId]
        );
        const [userAccess] = await dbManager.query(
            `
    SELECT access
    FROM roles
    WHERE roles.id = ? ;
    `,
            [userRole[0].role_id]
        );
        const access = userAccess[0].access;
        return access;
    } catch (err) {
        throw err;
    }
}
