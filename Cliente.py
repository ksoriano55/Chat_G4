import socket
import threading
import tkinter as tk
from tkinter import simpledialog, scrolledtext

HOST = '192.168.1.36'
PORT = 5000

class ChatClient:
    def __init__(self, master):
        self.master = master
        self.master.title("ChatApp")
        self.master.geometry("700x500")
        self.master.configure(bg="#ece5dd")

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.connect((HOST, PORT))

        self.username = simpledialog.askstring("Username", "Enter your username")
        self.socket.send(self.username.encode())

        # Panel de usuarios activos
        self.user_list_frame = tk.Frame(master, bg="#075e54", width=200)
        self.user_list_frame.pack(side=tk.LEFT, fill=tk.Y)

        self.users_label = tk.Label(self.user_list_frame, text="Usuarios", fg="white", bg="#075e54", font=("Helvetica", 12, "bold"))
        self.users_label.pack(pady=5)

        self.user_listbox = tk.Listbox(self.user_list_frame, bg="#128c7e", fg="white", font=("Helvetica", 10))
        self.user_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Panel de chat
        self.chat_frame = tk.Frame(master, bg="#ece5dd")
        self.chat_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        self.chat_area = scrolledtext.ScrolledText(self.chat_frame, state='disabled', bg="#ffffff", fg="#000000", wrap=tk.WORD, font=("Helvetica", 10))
        self.chat_area.pack(fill=tk.BOTH, expand=True, padx=10, pady=(10, 0))

        self.message_entry = tk.Entry(self.chat_frame, font=("Helvetica", 11), bg="#dcf8c6")
        self.message_entry.pack(fill=tk.X, padx=10, pady=(5, 10))
        self.message_entry.bind("<Return>", self.send_message)

        threading.Thread(target=self.receive_messages, daemon=True).start()

    def send_message(self, event=None):
        msg = self.message_entry.get().strip()
        if msg:
            full_msg = f"{self.username}: {msg}"
            self.socket.send(full_msg.encode())
            self.display_message(full_msg, local=True)
            self.message_entry.delete(0, tk.END)

    def display_message(self, message, local=False):
        self.chat_area.config(state='normal')
        if local:
            self.chat_area.insert(tk.END, message + '\n', 'self')
        else:
            self.chat_area.insert(tk.END, message + '\n')
        self.chat_area.config(state='disabled')
        self.chat_area.yview(tk.END)

    def receive_messages(self):
        while True:
            try:
                message = self.socket.recv(1024).decode()
                if message.startswith("USER_LIST:"):
                    user_list = message.replace("USER_LIST:", "").split(",")
                    self.user_listbox.delete(0, tk.END)
                    for user in user_list:
                        self.user_listbox.insert(tk.END, user)
                else:
                    self.display_message(message)
            except:
                break

if __name__ == "__main__":
    root = tk.Tk()
    client = ChatClient(root)
    
    # Agrega estilo personalizado para mensajes propios
    client.chat_area.tag_config('self', foreground="#34B7F1", font=("Helvetica", 10, "bold"))
    
    root.mainloop()
