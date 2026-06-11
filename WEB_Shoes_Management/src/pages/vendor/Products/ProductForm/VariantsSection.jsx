import { useFieldArray, useFormContext, Controller } from 'react-hook-form'
import { FiPlus, FiTrash2, FiChevronDown, FiLayers } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

export const VariantsSection = ({ attributes }) => {
  const { control, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, type: 'spring', bounce: 0.2 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-5">
        <div>
          <h3 className="text-xl font-extrabold text-brand-secondary tracking-tight flex items-center gap-2">
            <FiLayers className="text-brand-primary" /> Phân loại biến thể
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-1">Kích cỡ, màu sắc và số lượng tồn kho</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => append({ size: '', color: '', stock: 0 })}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary hover:text-white rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer"
        >
          <FiPlus size={16} /> Thêm phân loại
        </motion.button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {fields.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400"
            >
              <FiLayers size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-bold">Chưa có phân loại nào được thêm.</p>
            </motion.div>
          ) : (
            fields.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                key={item.id}
                className="flex flex-wrap md:flex-nowrap items-start gap-4 p-5 bg-white border border-gray-200 hover:border-brand-primary/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                {/* Size */}
                <div className="w-full md:w-1/3 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kích cỡ (Size)</label>
                  <Controller
                    name={`variants.${index}.size`}
                    control={control}
                    rules={{ required: 'Bắt buộc' }}
                    render={({ field }) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="flex w-full items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none hover:border-gray-400 cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-brand-primary/20">
                            <span>{field.value || 'Chọn Size'}</span>
                            <FiChevronDown size={16} className="text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-48 overflow-y-auto min-w-[120px] rounded-xl z-50">
                          {attributes?.sizes?.map(size => (
                            <DropdownMenuItem key={size} onClick={() => field.onChange(size)} className="font-semibold cursor-pointer py-2">{size}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  />
                  {errors.variants?.[index]?.size && <p className="text-[11px] text-red-500 font-bold">{errors.variants[index].size.message}</p>}
                </div>

                {/* Color */}
                <div className="w-full md:w-1/3 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Màu sắc (Tùy chọn)</label>
                  <Controller
                    name={`variants.${index}.color`}
                    control={control}
                    render={({ field }) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="flex w-full items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none hover:border-gray-400 cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-brand-primary/20">
                            <span>{field.value || 'Chọn màu'}</span>
                            <FiChevronDown size={16} className="text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-48 overflow-y-auto min-w-[150px] rounded-xl z-50">
                          <DropdownMenuItem onClick={() => field.onChange('')} className="font-semibold cursor-pointer text-gray-400 py-2">Bỏ chọn màu</DropdownMenuItem>
                          {attributes?.colors?.map(color => (
                            <DropdownMenuItem key={color.name} onClick={() => field.onChange(color.name)} className="font-semibold cursor-pointer flex items-center gap-2 py-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }}></span> {color.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  />
                </div>

                {/* Stock */}
                <div className="w-full md:w-1/4 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tồn kho</label>
                  <Controller
                    name={`variants.${index}.stock`}
                    control={control}
                    rules={{ required: 'Bắt buộc', min: { value: 0, message: '>= 0' } }}
                    render={({ field }) => (
                      <Input type="number" {...field} className="bg-gray-50 hover:bg-white border-gray-200 py-5 rounded-xl font-bold transition-all duration-300 focus-visible:ring-brand-primary/20" placeholder="0" />
                    )}
                  />
                  {errors.variants?.[index]?.stock && <p className="text-[10px] text-red-500 font-bold">{errors.variants[index].stock.message}</p>}
                </div>

                {/* Nút Xóa Biến Thể */}
                <div className="w-full md:w-auto flex items-end pb-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => remove(index)}
                        className="p-3 bg-white text-gray-400 border border-gray-200 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all duration-100 cursor-pointer shadow-sm group-hover:border-red-100"
                        title="Xóa biến thể này"
                      >
                        <FiTrash2 size={16} />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent className="font-semibold" duration="100">
                            Xóa
                    </TooltipContent>
                  </Tooltip>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}