-- Create rooms table for game sessions
CREATE TABLE public.rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(6) NOT NULL UNIQUE,
    host_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'voting', 'finished')),
    player_count INTEGER NOT NULL DEFAULT 4,
    imposter_count INTEGER NOT NULL DEFAULT 1,
    category VARCHAR(50) NOT NULL DEFAULT 'random',
    secret_word TEXT,
    discussion_time INTEGER NOT NULL DEFAULT 90,
    discussion_time_enabled BOOLEAN NOT NULL DEFAULT true,
    current_player_index INTEGER NOT NULL DEFAULT 0,
    winner VARCHAR(20) CHECK (winner IN ('imposters', 'players')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_players table for players in each room
CREATE TABLE public.room_players (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    player_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar VARCHAR(10) NOT NULL DEFAULT '👤',
    is_host BOOLEAN NOT NULL DEFAULT false,
    is_imposter BOOLEAN NOT NULL DEFAULT false,
    has_seen_role BOOLEAN NOT NULL DEFAULT false,
    votes INTEGER NOT NULL DEFAULT 0,
    voted_for UUID,
    player_order INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(room_id, player_id)
);

-- Create index for faster room code lookups
CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_room_players_room_id ON public.room_players(room_id);
CREATE INDEX idx_room_players_player_id ON public.room_players(player_id);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms - anyone can read rooms they're in or by code
CREATE POLICY "Anyone can read rooms by code"
    ON public.rooms FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create rooms"
    ON public.rooms FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Host can update their room"
    ON public.rooms FOR UPDATE
    USING (true);

CREATE POLICY "Host can delete their room"
    ON public.rooms FOR DELETE
    USING (true);

-- RLS Policies for room_players
CREATE POLICY "Anyone can read room players"
    ON public.room_players FOR SELECT
    USING (true);

CREATE POLICY "Anyone can join room"
    ON public.room_players FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Players can update themselves"
    ON public.room_players FOR UPDATE
    USING (true);

CREATE POLICY "Players can leave room"
    ON public.room_players FOR DELETE
    USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;

-- Function to generate random room code
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(6) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_room_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_room_updated_at();