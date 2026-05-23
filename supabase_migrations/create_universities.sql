-- Create universities table
CREATE TABLE IF NOT EXISTS public.universities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    image_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create room_universities junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.room_universities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    distance_km DECIMAL(5,2), -- Distance in kilometers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, university_id)
);

-- Insert initial universities data
INSERT INTO public.universities (name, short_name, description, address, image_url) VALUES
('Trường Đại học FPT Hà Nội', 'FPTU', 'Trường Đại học FPT cơ sở Hà Nội', 'Khu Công nghệ cao Hòa Lạc, Km29, Đại lộ Thăng Long, Huyện Thạch Thất, Hà Nội', '/images/dh_fptu.jpg'),
('Học viện Tài chính', 'HVTC', 'Học viện Tài chính', 'Số 58 Lê Văn Hiến, Đức Thắng, Bắc Từ Liêm, Hà Nội', '/images/dh_hvtc.jpg'),
('Đại học Quốc gia Hà Nội', 'ĐHQG HN', 'Đại học Quốc gia Hà Nội', 'Xuân Thủy, Cầu Giấy, Hà Nội', '/images/dh_vnu.png');
-- Enable RLS
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_universities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Universities are viewable by everyone" ON public.universities
    FOR SELECT USING (true);

CREATE POLICY "Room universities are viewable by everyone" ON public.room_universities
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own room universities" ON public.room_universities
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.rooms 
        WHERE rooms.id = room_universities.room_id 
        AND rooms.owner_id = auth.uid()
    ));

CREATE POLICY "Users can update their own room universities" ON public.room_universities
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.rooms 
        WHERE rooms.id = room_universities.room_id 
        AND rooms.owner_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own room universities" ON public.room_universities
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM public.rooms 
        WHERE rooms.id = room_universities.room_id 
        AND rooms.owner_id = auth.uid()
    ));

-- Create indexes for better performance
CREATE INDEX idx_room_universities_room_id ON public.room_universities(room_id);
CREATE INDEX idx_room_universities_university_id ON public.room_universities(university_id);
CREATE INDEX idx_universities_short_name ON public.universities(short_name);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON public.universities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();