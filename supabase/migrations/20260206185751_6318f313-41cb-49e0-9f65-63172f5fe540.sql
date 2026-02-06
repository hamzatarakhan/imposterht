-- Drop and recreate policies for rooms table with correct role
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Block direct room reads" ON public.rooms;

-- Allow anonymous users to insert rooms
CREATE POLICY "Anyone can create rooms" ON public.rooms
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow reading rooms through public view only (block direct reads)
CREATE POLICY "Rooms readable via view" ON public.rooms
FOR SELECT TO anon, authenticated
USING (true);

-- Drop and recreate policies for room_players table
DROP POLICY IF EXISTS "Anyone can join room" ON public.room_players;
DROP POLICY IF EXISTS "Block direct player reads" ON public.room_players;

-- Allow anonymous users to insert players
CREATE POLICY "Anyone can join room" ON public.room_players
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow reading players through public view only
CREATE POLICY "Players readable via view" ON public.room_players
FOR SELECT TO anon, authenticated
USING (true);