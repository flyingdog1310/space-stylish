import { pool } from "../util/mysql.js";

//-------------User Sign Up API--------------------------------------
export async function createUser(name, email, hashedPassword) {
    try {
        const [userResult] = await pool.query(
            `
        INSERT INTO user (name,email,password)
        VALUES(?,?,?);
        `,
            [name, email, hashedPassword]
        );
        const [providerResult] = await pool.query(
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
        console.log(err);
    }
}
export async function createFbUser(name, email) {
    try {
        const [userResult] = await pool.query(
            `
        INSERT INTO user (name,email)
        VALUES(?,?);
`,
            [name, email]
        );
        const [providerResult] = await pool.query(
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
        console.log(err);
    }
}
//-------------User Sign In API-----------------------------------------
export async function checkUser(email, provider) {
    const [userResult] = await pool.query(
        `
    SELECT user.id
    FROM user
    WHERE  email = ? ;
    `,
        [email]
    );

    if (userResult[0]) {
        const [providerResult] = await pool.query(
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
    const [signInResult] = await pool.query(
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
    const [signInResult] = await pool.query(
        `
    SELECT user.id,user.name,user.email,user.picture
    FROM user
    WHERE  email = ? ;
    `,
        [email]
    );
    console.log(signInResult[0]);
    signInResult[0].provider = provider;
    return signInResult[0];
}

//-------------User Profile API-----------------------------------------
export async function getUserprofile(userId, provider) {
    try {
        const [userData] = await pool.query(
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
        console.log(err);
    }
}

//------------User Role Access Apply-------------------------------------

export async function createRole(role, accessArr) {
    const [roleResult] = await pool.query(
        `
        INSERT INTO roles (role,access)
        VALUES(?,?);
    `,
        [role, accessArr]
    );
    return roleResult;
}

export async function assignRole(userId, roleId) {
    const [userRole] = await pool.query(
        `
        UPDATE user 
        SET role_id= ? 
        WHERE id = ?;
    `,
        [roleId, userId]
    );
    console.log(userRole);
    return userRole;
}

export async function getUserAccess(userId) {
    try {
        const [userRole] = await pool.query(
            `
        SELECT role_id
        FROM user
        WHERE user.id= ? ;
    `,
            [userId]
        );
        console.log(userRole);
        const [userAccess] = await pool.query(
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
        console.log(err);
    }
}
