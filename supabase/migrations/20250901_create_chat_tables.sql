-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    company_id UUID REFERENCES profiles(id) NOT NULL,
    job_posting_id UUID REFERENCES job_postings(id),
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    user_unread_count INTEGER DEFAULT 0,
    company_unread_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_chat_rooms_user_id ON chat_rooms(user_id);
CREATE INDEX idx_chat_rooms_company_id ON chat_rooms(company_id);
CREATE INDEX idx_chat_rooms_application_id ON chat_rooms(application_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_rooms
CREATE POLICY "Users can view their chat rooms" ON chat_rooms
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = company_id);

CREATE POLICY "Users can create chat rooms" ON chat_rooms
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = company_id);

CREATE POLICY "Users can update their chat rooms" ON chat_rooms
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = company_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = chat_messages.room_id 
            AND (chat_rooms.user_id = auth.uid() OR chat_rooms.company_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their rooms" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = chat_messages.room_id 
            AND (chat_rooms.user_id = auth.uid() OR chat_rooms.company_id = auth.uid())
        )
    );

-- Function to update last message in chat room
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms
    SET 
        last_message = NEW.message,
        last_message_at = NEW.created_at,
        user_unread_count = CASE 
            WHEN NEW.sender_id = chat_rooms.company_id THEN user_unread_count + 1
            ELSE user_unread_count
        END,
        company_unread_count = CASE 
            WHEN NEW.sender_id = chat_rooms.user_id THEN company_unread_count + 1
            ELSE company_unread_count
        END,
        updated_at = now()
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat room on new message
CREATE TRIGGER update_chat_room_on_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_room_last_message();