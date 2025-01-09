const resetUserBill = (io, socket, rooms) => {
  socket.on("resetUserBill", (data) => {
    const { roomId, userId } = data

    const room = rooms[roomId]
    if (!room) {
      io.to(userId).emit("error", { message: "Комната не найдена" })
      return
    }

    const user = room.users.find((user) => user.id === userId)
    if (!user) {
      io.to(userId).emit("error", {
        message: "Пользователь не найден в комнате",
      })
      return
    }

    // Сбрасываем счет пользователя
    const amountToReset = user.userBill || 0
    user.userBill = 0

    // Увеличиваем общий счет комнаты
    room.billData.total += amountToReset

    // Восстанавливаем изначальные количества позиций
    if (user.addedItems) {
      for (const itemId in user.addedItems) {
        const item = room.billData.items.find(
          (item) => item.id === parseInt(itemId)
        )
        if (item) {
          item.quantity += user.addedItems[itemId]
        }
      }
      user.addedItems = {}
    }

    // Убедитесь, что изначальное количество не изменяется
    room.billData.items.forEach((item) => {
      if (item.originalQuantity !== undefined) {
        item.quantity = item.originalQuantity
      }
    })

    // Отправляем обновленные данные клиенту
    io.to(roomId).emit("userBillUpdated", {
      users: room.users,
      items: room.billData.items,
      total: room.billData.total,
    })
  })
}

module.exports = resetUserBill
