import avatarWoman1 from "@/assets/avatar-woman-1.jpg";
import avatarWoman2 from "@/assets/avatar-woman-2.jpg";
import avatarWoman3 from "@/assets/avatar-woman-3.jpg";
import avatarWoman4 from "@/assets/avatar-woman-4.jpg";

export default function Example() {
    return (
        <div className="flex items-center divide-x divide-white/20">
            <div className="flex -space-x-3 pr-3">
                <img src={avatarWoman1} alt="Happy user" className="w-12 h-12 rounded-full border-2 border-white hover:-translate-y-1 transition z-1" />
                <img src={avatarWoman2} alt="Satisfied customer" className="w-12 h-12 rounded-full border-2 border-white hover:-translate-y-1 transition z-[2]" />
                <img src={avatarWoman3} alt="Product user" className="w-12 h-12 rounded-full border-2 border-white hover:-translate-y-1 transition z-[3]" />
                <img src={avatarWoman4} alt="Customer testimonial" className="w-12 h-12 rounded-full border-2 border-white hover:-translate-y-1 transition z-[4]" />
            </div>
            <div className="pl-3">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#FACC15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#FACC15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#FACC15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#FACC15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#FACC15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                    </svg>
                    <p className="text-white font-medium ml-2">5.0</p>
                </div>
                <p className="text-sm text-white/80">Trusted by <span className="font-medium text-white">100,000+</span> women</p>
            </div>
        </div>
    );
};