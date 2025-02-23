export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  let mainStore = {
    whatsapp: {
      templateName: "pdf_sender",
    },
  };

  const messageData = {
    messaging_product: "whatsapp",
    to: "9647856260420",
    type: "template",
    template: {
      name: mainStore.whatsapp.templateName,
      language: { code: "en_US" },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "document",
              document: {
                link: "https://res.cloudinary.com/dvrenrmbg/raw/upload/v1740147609/pdf_files/hvsplrk1yjkfmlxyi34b.pdf",
                filename: "Application_Details.pdf",
              },
            },
          ],
        },
        {
          type: "body",
          parameters: [],
        },
      ],
    },
  };

  try {
    return await sendWhatsAppMessage(config.long_lived_token, config.phone_number_id, messageData);
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.data?.error?.code === 190) {
      console.log("🔄 Token expired, refreshing...");

      const refreshResponse: any = await $fetch("/api/facebook/refreshToken");

      if (refreshResponse.success && refreshResponse.newToken) {
        console.log("✅ Token refreshed successfully!");

        config.access_token = refreshResponse.newToken;

        return await sendWhatsAppMessage(config.access_token, config.phone_number_id, messageData);
      } else {
        console.error("❌ Failed to refresh token:", refreshResponse.error);
        return { error: "Token refresh failed", details: refreshResponse.error };
      }
    }

    return { error: "Message error", details: error.statusMessage };
  }
});

async function sendWhatsAppMessage(accessToken: string, phoneNumberId: string, messageData: any) {
  return await $fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(messageData),
  });
}
