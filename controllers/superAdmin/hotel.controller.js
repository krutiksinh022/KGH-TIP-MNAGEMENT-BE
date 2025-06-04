

export const createHotel = async (req, res) => {
    try {
        console.log(req.user)
    //     const result = await createhotelValidator.validateAsync(req.body);
    //    console.log("createHotel controller called");  
    } catch (error) {
        return errorResponse(res, { success: false, message: "Internal Server Error" }, 500, error);
    }
}